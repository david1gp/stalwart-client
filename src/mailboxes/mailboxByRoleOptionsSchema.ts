import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

export const mailboxByRoleOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  /** Special-use role, e.g. `inbox`, `sent`, `drafts`, `trash` or `junk`. */
  role: a.string(),
})

export type MailboxByRoleOptions = a.InferInput<typeof mailboxByRoleOptionsSchema>
