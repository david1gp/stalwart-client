import * as a from "valibot"
import { type PromiseResult } from "#result"
import { createResultError } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapSetResponse } from "../jmap/jmapSetResponse.js"
import { jmapSetErrorCheck } from "../jmap/jmapSetErrorCheck.js"
import { mailAccountIdResolve } from "../mailboxes/mailAccountIdResolve.js"
import type { EmailSubmission } from "./EmailSubmission.js"
import { type EmailSubmissionSetOptions, emailSubmissionSetOptionsSchema } from "./emailSubmissionSetOptionsSchema.js"

const capability = "urn:ietf:params:jmap:submission"

/**
 * `EmailSubmission/set` — submit emails for sending (`crates/jmap-proto/src/object/email_submission.rs:260`).
 * Any `not*` entry makes the whole call a ResultErr via `jmapSetErrorCheck`.
 */
export async function emailSubmissionSet(
  options: EmailSubmissionSetOptions,
): PromiseResult<JmapSetResponse<EmailSubmission>> {
  const op = "emailSubmissionSet"
  const parsed = a.safeParse(emailSubmissionSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, ...args } = parsed.output
  if (args.create === undefined && args.update === undefined && args.destroy === undefined) {
    return createResultError(op, "emailSubmissionSet needs at least one of create, update or destroy")
  }
  const resolved = await mailAccountIdResolve({ accountId, capability, config })
  if (!resolved.success) return resolved
  const response = await stalwartMethodCall<JmapSetResponse<EmailSubmission>>({
    config,
    methodName: "EmailSubmission/set",
    arguments: bodyOmitUndefined({ accountId: resolved.data.accountId, ...args }),
    ...(resolved.data.session === undefined ? {} : { session: resolved.data.session }),
  })
  if (!response.success) return response
  return jmapSetErrorCheck(op, response.data)
}
