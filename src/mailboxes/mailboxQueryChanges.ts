import * as a from "valibot"
import { type PromiseResult } from "#result"
import { createResultError } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapQueryChangesResponse } from "../jmap/jmapQueryChangesResponse.js"
import { mailAccountIdResolve } from "./mailAccountIdResolve.js"
import {
  type MailboxQueryChangesOptions,
  mailboxQueryChangesOptionsSchema,
} from "./mailboxQueryChangesOptionsSchema.js"

const capability = "urn:ietf:params:jmap:mail"

/** `Mailbox/queryChanges` — added/removed mailbox ids since `sinceQueryState`. */
export async function mailboxQueryChanges(
  options: MailboxQueryChangesOptions,
): PromiseResult<JmapQueryChangesResponse> {
  const op = "mailboxQueryChanges"
  const parsed = a.safeParse(mailboxQueryChangesOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, ...args } = parsed.output
  const resolved = await mailAccountIdResolve({ accountId, capability, config })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapQueryChangesResponse>({
    config,
    methodName: "Mailbox/queryChanges",
    arguments: bodyOmitUndefined({ accountId: resolved.data.accountId, ...args }),
    ...(resolved.data.session === undefined ? {} : { session: resolved.data.session }),
  })
}
