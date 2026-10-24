import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/** Options for `memoryLookupKeyGet`. */
export const memoryLookupKeyGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  ids: a.optional(a.array(a.string())),
  properties: a.optional(a.array(a.string())),
  accountId: a.optional(a.string()),
})

export type MemoryLookupKeyGetOptions = a.InferInput<typeof memoryLookupKeyGetOptionsSchema>
