import * as a from "valibot"
import { type PromiseResult } from "#result"
import { createResultError } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapGetResponse } from "../jmap/jmapGetResponse.js"
import { type MailboxGetOptions, mailboxGetOptionsSchema } from "./mailboxGetOptionsSchema.js"
import type { Mailbox } from "./Mailbox.js"
import { mailAccountIdResolve } from "./mailAccountIdResolve.js"

const capability = "urn:ietf:params:jmap:mail"

/** `Mailbox/get` — fetch mailboxes by id (omit `ids` to fetch all). */
export async function mailboxGet(options: MailboxGetOptions): PromiseResult<JmapGetResponse<Mailbox>> {
  const op = "mailboxGet"
  const parsed = a.safeParse(mailboxGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, ...args } = parsed.output
  const resolved = await mailAccountIdResolve({ accountId, capability, config })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapGetResponse<Mailbox>>({
    config,
    methodName: "Mailbox/get",
    arguments: bodyOmitUndefined({ accountId: resolved.data.accountId, ...args }),
    ...(resolved.data.session === undefined ? {} : { session: resolved.data.session }),
  })
}
