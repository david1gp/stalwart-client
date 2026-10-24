import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"
import { registryFilterSchema } from "../registryFilterSchema.js"

/**
 * Options for `spamTrapQuery` — a `MemoryLookupKey` query pre-filtered to the
 * `spam-traps` namespace (`resources/schema/schema.json.gz` `x:MemoryLookupKey/SpamTrap`
 * `filtersStatic`). Extra `filter` fields are merged; `namespace` is forced to `spam-traps`.
 */
export const spamTrapQueryOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  filter: a.optional(registryFilterSchema),
  sort: a.optional(a.array(a.object({ property: a.string(), isAscending: a.optional(a.boolean()) }))),
  position: a.optional(a.pipe(a.number(), a.integer())),
  anchor: a.optional(a.string()),
  anchorOffset: a.optional(a.pipe(a.number(), a.integer())),
  limit: a.optional(a.pipe(a.number(), a.integer(), a.minValue(0))),
  calculateTotal: a.optional(a.boolean()),
  accountId: a.optional(a.string()),
})

export type SpamTrapQueryOptions = a.InferInput<typeof spamTrapQueryOptionsSchema>
