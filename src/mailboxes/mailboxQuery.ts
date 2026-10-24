import * as a from "valibot"
import { type PromiseResult } from "#result"
import { createResultError } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapQueryResponse } from "../jmap/jmapQueryResponse.js"
import { mailAccountIdResolve } from "./mailAccountIdResolve.js"
import { type MailboxQueryOptions, mailboxQueryOptionsSchema } from "./mailboxQueryOptionsSchema.js"

const capability = "urn:ietf:params:jmap:mail"

/**
 * `Mailbox/query` — list mailbox ids (`sortAsTree`/`filterAsTree` are
 * Stalwart extras, `crates/jmap-proto/src/object/mailbox.rs:196`).
 */
export async function mailboxQuery(options: MailboxQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "mailboxQuery"
  const parsed = a.safeParse(mailboxQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, ...args } = parsed.output
  const resolved = await mailAccountIdResolve({ accountId, capability, config })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapQueryResponse>({
    config,
    methodName: "Mailbox/query",
    arguments: bodyOmitUndefined({ accountId: resolved.data.accountId, ...args }),
    ...(resolved.data.session === undefined ? {} : { session: resolved.data.session }),
  })
}
