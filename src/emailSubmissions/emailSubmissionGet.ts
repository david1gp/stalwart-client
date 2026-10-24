import * as a from "valibot"
import { type PromiseResult } from "#result"
import { createResultError } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapGetResponse } from "../jmap/jmapGetResponse.js"
import { mailAccountIdResolve } from "../mailboxes/mailAccountIdResolve.js"
import type { EmailSubmission } from "./EmailSubmission.js"
import { type EmailSubmissionGetOptions, emailSubmissionGetOptionsSchema } from "./emailSubmissionGetOptionsSchema.js"

const capability = "urn:ietf:params:jmap:submission"

/** `EmailSubmission/get` — fetch submissions by id (omit `ids` to fetch all). */
export async function emailSubmissionGet(
  options: EmailSubmissionGetOptions,
): PromiseResult<JmapGetResponse<EmailSubmission>> {
  const op = "emailSubmissionGet"
  const parsed = a.safeParse(emailSubmissionGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, ...args } = parsed.output
  const resolved = await mailAccountIdResolve({ accountId, capability, config })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapGetResponse<EmailSubmission>>({
    config,
    methodName: "EmailSubmission/get",
    arguments: bodyOmitUndefined({ accountId: resolved.data.accountId, ...args }),
    ...(resolved.data.session === undefined ? {} : { session: resolved.data.session }),
  })
}
