import * as a from "valibot"
import { type PromiseResult } from "#result"
import { createResultError } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapSetResponse } from "../jmap/jmapSetResponse.js"
import { jmapSetErrorCheck } from "../jmap/jmapSetErrorCheck.js"
import { mailAccountIdResolve } from "../mailboxes/mailAccountIdResolve.js"
import type { Email } from "./Email.js"
import { type EmailImportOptions, emailImportOptionsSchema } from "./emailImportOptionsSchema.js"

const capability = "urn:ietf:params:jmap:mail"

/**
 * `Email/import` — import messages from uploaded blobs (RFC 8621 §5). Use
 * `emailImportRaw` to upload RFC 5322 bytes and import in one step.
 */
export async function emailImport(options: EmailImportOptions): PromiseResult<JmapSetResponse<Email>> {
  const op = "emailImport"
  const parsed = a.safeParse(emailImportOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, ...args } = parsed.output
  const resolved = await mailAccountIdResolve({ accountId, capability, config })
  if (!resolved.success) return resolved
  const response = await stalwartMethodCall<JmapSetResponse<Email>>({
    config,
    methodName: "Email/import",
    arguments: bodyOmitUndefined({ accountId: resolved.data.accountId, ...args }),
    ...(resolved.data.session === undefined ? {} : { session: resolved.data.session }),
  })
  if (!response.success) return response
  return jmapSetErrorCheck(op, response.data)
}
