import * as a from "valibot"
import { type PromiseResult } from "#result"
import { createResultError } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapSetResponse } from "../jmap/jmapSetResponse.js"
import { jmapSetErrorCheck } from "../jmap/jmapSetErrorCheck.js"
import { jmapUpload } from "../jmap/jmapUpload.js"
import { mailAccountIdResolve } from "../mailboxes/mailAccountIdResolve.js"
import type { Email } from "./Email.js"
import { type EmailImportRawOptions, emailImportRawOptionsSchema } from "./emailImportRawOptionsSchema.js"

const capability = "urn:ietf:params:jmap:mail"

/** Upload RFC 5322 bytes, then `Email/import` the resulting blob in one step. */
export async function emailImportRaw(options: EmailImportRawOptions): PromiseResult<JmapSetResponse<Email>> {
  const op = "emailImportRaw"
  const parsed = a.safeParse(emailImportRawOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, mailboxIds, keywords, receivedAt, raw } = parsed.output
  const resolved = await mailAccountIdResolve({ accountId, capability, config })
  if (!resolved.success) return resolved
  const uploaded = await jmapUpload({
    config,
    accountId: resolved.data.accountId,
    data: raw,
    contentType: "message/rfc822",
    ...(resolved.data.session === undefined ? {} : { session: resolved.data.session }),
  })
  if (!uploaded.success) return uploaded
  const mailboxMap: Record<string, boolean> = {}
  for (const id of mailboxIds) mailboxMap[id] = true
  const response = await stalwartMethodCall<JmapSetResponse<Email>>({
    config,
    methodName: "Email/import",
    arguments: bodyOmitUndefined({
      accountId: resolved.data.accountId,
      emails: {
        m1: bodyOmitUndefined({ blobId: uploaded.data.blobId, mailboxIds: mailboxMap, keywords, receivedAt }),
      },
    }),
    ...(resolved.data.session === undefined ? {} : { session: resolved.data.session }),
  })
  if (!response.success) return response
  return jmapSetErrorCheck(op, response.data)
}
