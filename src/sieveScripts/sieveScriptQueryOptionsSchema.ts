import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `SieveScript/query` arguments (filter: `name`, `isActive`). */
export const sieveScriptQueryOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  filter: a.optional(a.record(a.string(), a.unknown())),
  sort: a.optional(a.array(a.record(a.string(), a.unknown()))),
  position: a.optional(a.number()),
  limit: a.optional(a.number()),
  calculateTotal: a.optional(a.boolean()),
})

export type SieveScriptQueryOptions = a.InferInput<typeof sieveScriptQueryOptionsSchema>
