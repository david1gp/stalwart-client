import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `ContactCard/changes` arguments. */
export const contactCardChangesOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  sinceState: a.string(),
  maxChanges: a.optional(a.number()),
})

export type ContactCardChangesOptions = a.InferInput<typeof contactCardChangesOptionsSchema>
