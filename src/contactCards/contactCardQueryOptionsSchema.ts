import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `ContactCard/query` arguments. */
export const contactCardQueryOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  filter: a.optional(a.record(a.string(), a.unknown())),
  sort: a.optional(a.array(a.record(a.string(), a.unknown()))),
  position: a.optional(a.number()),
  limit: a.optional(a.number()),
  calculateTotal: a.optional(a.boolean()),
})

export type ContactCardQueryOptions = a.InferInput<typeof contactCardQueryOptionsSchema>
