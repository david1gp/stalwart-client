import * as a from "valibot"
import { type PromiseResult } from "#result"
import { createResultError } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { mailAccountIdResolve } from "../mailboxes/mailAccountIdResolve.js"
import type { EmailParseResponse } from "./EmailParseResponse.js"
import { type EmailParseOptions, emailParseOptionsSchema } from "./emailParseOptionsSchema.js"

const capability = "urn:ietf:params:jmap:mail"

/** `Email/parse` — parse uploaded blobs into Email objects without importing them. */
export async function emailParse(options: EmailParseOptions): PromiseResult<EmailParseResponse> {
  const op = "emailParse"
  const parsed = a.safeParse(emailParseOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, ...args } = parsed.output
  const resolved = await mailAccountIdResolve({ accountId, capability, config })
  if (!resolved.success) return resolved
  return stalwartMethodCall<EmailParseResponse>({
    config,
    methodName: "Email/parse",
    arguments: bodyOmitUndefined({ accountId: resolved.data.accountId, ...args }),
    ...(resolved.data.session === undefined ? {} : { session: resolved.data.session }),
  })
}
