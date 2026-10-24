import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

export const mailboxQueryChangesOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  filter: a.optional(a.record(a.string(), a.unknown())),
  sort: a.optional(a.array(a.record(a.string(), a.unknown()))),
  sinceQueryState: a.string(),
  maxChanges: a.optional(a.pipe(a.number(), a.integer(), a.minValue(0))),
  upToId: a.optional(a.string()),
  calculateTotal: a.optional(a.boolean()),
})

export type MailboxQueryChangesOptions = a.InferInput<typeof mailboxQueryChangesOptionsSchema>
