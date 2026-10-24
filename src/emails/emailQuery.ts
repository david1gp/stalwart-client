import * as a from "valibot"
import { type PromiseResult } from "#result"
import { createResultError } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapQueryResponse } from "../jmap/jmapQueryResponse.js"
import { mailAccountIdResolve } from "../mailboxes/mailAccountIdResolve.js"
import { type EmailQueryOptions, emailQueryOptionsSchema } from "./emailQueryOptionsSchema.js"

const capability = "urn:ietf:params:jmap:mail"

/**
 * `Email/query` — list email ids (`collapseThreads` is the Stalwart/RFC 8621
 * extra, `crates/jmap-proto/src/object/email.rs:409`).
 */
export async function emailQuery(options: EmailQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "emailQuery"
  const parsed = a.safeParse(emailQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, ...args } = parsed.output
  const resolved = await mailAccountIdResolve({ accountId, capability, config })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapQueryResponse>({
    config,
    methodName: "Email/query",
    arguments: bodyOmitUndefined({ accountId: resolved.data.accountId, ...args }),
    ...(resolved.data.session === undefined ? {} : { session: resolved.data.session }),
  })
}
