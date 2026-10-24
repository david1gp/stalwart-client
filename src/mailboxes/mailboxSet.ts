import * as a from "valibot"
import { type PromiseResult } from "#result"
import { createResultError } from "#result"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapSetResponse } from "../jmap/jmapSetResponse.js"
import { jmapSetErrorCheck } from "../jmap/jmapSetErrorCheck.js"
import { mailAccountIdResolve } from "./mailAccountIdResolve.js"
import type { Mailbox } from "./Mailbox.js"
import { type MailboxSetOptions, mailboxSetOptionsSchema } from "./mailboxSetOptionsSchema.js"

const capability = "urn:ietf:params:jmap:mail"

/**
 * `Mailbox/set` — create, update and/or destroy mailboxes.
 * `onDestroyRemoveEmails` is the Stalwart extra
 * (`crates/jmap-proto/src/object/mailbox.rs:191`). Any `not*` entry makes the
 * whole call a ResultErr via `jmapSetErrorCheck`.
 */
export async function mailboxSet(options: MailboxSetOptions): PromiseResult<JmapSetResponse<Mailbox>> {
  const op = "mailboxSet"
  const parsed = a.safeParse(mailboxSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, ...args } = parsed.output
  if (args.create === undefined && args.update === undefined && args.destroy === undefined) {
    return createResultError(op, "mailboxSet needs at least one of create, update or destroy")
  }
  const resolved = await mailAccountIdResolve({ accountId, capability, config })
  if (!resolved.success) return resolved
  const response = await stalwartMethodCall<JmapSetResponse<Mailbox>>({
    config,
    methodName: "Mailbox/set",
    arguments: Object.fromEntries(
      Object.entries({ accountId: resolved.data.accountId, ...args }).filter(([, value]) => value !== undefined),
    ),
    ...(resolved.data.session === undefined ? {} : { session: resolved.data.session }),
  })
  if (!response.success) return response
  return jmapSetErrorCheck(op, response.data)
}
