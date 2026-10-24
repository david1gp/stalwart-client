import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailboxGet } from "./mailboxGet.js"
import { type MailboxByRoleOptions, mailboxByRoleOptionsSchema } from "./mailboxByRoleOptionsSchema.js"
import type { Mailbox } from "./Mailbox.js"

/** Find a mailbox id by special-use role (e.g. `inbox`, `sent`, `drafts`). Returns a ResultErr when none matches. */
export async function mailboxByRole(options: MailboxByRoleOptions): PromiseResult<string> {
  const op = "mailboxByRole"
  const parsed = a.safeParse(mailboxByRoleOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, role } = parsed.output
  const mailboxes = await mailboxGet({
    ...(accountId === undefined ? {} : { accountId }),
    config,
    properties: ["id", "role"],
  })
  if (!mailboxes.success) return mailboxes
  const match = (mailboxes.data.list as readonly Mailbox[]).find((mailbox) => mailbox.role === role)
  if (match === undefined) return createResultError(op, `No mailbox with role ${JSON.stringify(role)}`)
  return createResult(match.id)
}
