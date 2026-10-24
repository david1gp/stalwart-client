import * as a from "valibot"
import { type PromiseResult } from "#result"
import { createResultError } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapQueryResponse } from "../jmap/jmapQueryResponse.js"
import { mailAccountIdResolve } from "../mailboxes/mailAccountIdResolve.js"
import {
  type EmailSubmissionQueryOptions,
  emailSubmissionQueryOptionsSchema,
} from "./emailSubmissionQueryOptionsSchema.js"

const capability = "urn:ietf:params:jmap:submission"

/** `EmailSubmission/query` — list submission ids. */
export async function emailSubmissionQuery(options: EmailSubmissionQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "emailSubmissionQuery"
  const parsed = a.safeParse(emailSubmissionQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, ...args } = parsed.output
  const resolved = await mailAccountIdResolve({ accountId, capability, config })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapQueryResponse>({
    config,
    methodName: "EmailSubmission/query",
    arguments: bodyOmitUndefined({ accountId: resolved.data.accountId, ...args }),
    ...(resolved.data.session === undefined ? {} : { session: resolved.data.session }),
  })
}
