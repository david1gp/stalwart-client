import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `AddressBook/changes` arguments. */
export const addressBookChangesOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  sinceState: a.string(),
  maxChanges: a.optional(a.number()),
})

export type AddressBookChangesOptions = a.InferInput<typeof addressBookChangesOptionsSchema>
