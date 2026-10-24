import * as a from "valibot"
import { type PromiseResult } from "#result"
import { createResultError } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapChangesResponse } from "../jmap/jmapChangesResponse.js"
import { mailAccountIdResolve } from "./mailAccountIdResolve.js"
import { type MailboxChangesOptions, mailboxChangesOptionsSchema } from "./mailboxChangesOptionsSchema.js"

const capability = "urn:ietf:params:jmap:mail"

/** `Mailbox/changes` — created/updated/destroyed mailbox ids since `sinceState`. */
export async function mailboxChanges(options: MailboxChangesOptions): PromiseResult<JmapChangesResponse> {
  const op = "mailboxChanges"
  const parsed = a.safeParse(mailboxChangesOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, ...args } = parsed.output
  const resolved = await mailAccountIdResolve({ accountId, capability, config })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapChangesResponse>({
    config,
    methodName: "Mailbox/changes",
    arguments: bodyOmitUndefined({ accountId: resolved.data.accountId, ...args }),
    ...(resolved.data.session === undefined ? {} : { session: resolved.data.session }),
  })
}
