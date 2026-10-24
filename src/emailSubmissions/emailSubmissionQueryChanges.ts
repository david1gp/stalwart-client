import * as a from "valibot"
import { type PromiseResult } from "#result"
import { createResultError } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapQueryChangesResponse } from "../jmap/jmapQueryChangesResponse.js"
import { mailAccountIdResolve } from "../mailboxes/mailAccountIdResolve.js"
import {
  type EmailSubmissionQueryChangesOptions,
  emailSubmissionQueryChangesOptionsSchema,
} from "./emailSubmissionQueryChangesOptionsSchema.js"

const capability = "urn:ietf:params:jmap:submission"

/** `EmailSubmission/queryChanges` — added/removed submission ids since `sinceQueryState`. */
export async function emailSubmissionQueryChanges(
  options: EmailSubmissionQueryChangesOptions,
): PromiseResult<JmapQueryChangesResponse> {
  const op = "emailSubmissionQueryChanges"
  const parsed = a.safeParse(emailSubmissionQueryChangesOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, ...args } = parsed.output
  const resolved = await mailAccountIdResolve({ accountId, capability, config })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapQueryChangesResponse>({
    config,
    methodName: "EmailSubmission/queryChanges",
    arguments: bodyOmitUndefined({ accountId: resolved.data.accountId, ...args }),
    ...(resolved.data.session === undefined ? {} : { session: resolved.data.session }),
  })
}
