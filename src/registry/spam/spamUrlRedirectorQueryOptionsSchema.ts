import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"
import { registryFilterSchema } from "../registryFilterSchema.js"

/**
 * Options for `spamUrlRedirectorQuery` — a `MemoryLookupKey` query pre-filtered to the
 * `url-redirectors` namespace (`resources/schema/schema.json.gz` `x:MemoryLookupKey/SpamUrlRedirector`
 * `filtersStatic`). Extra `filter` fields are merged; `namespace` is forced to `url-redirectors`.
 */
export const spamUrlRedirectorQueryOptionsSchema = a.object({
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

export type SpamUrlRedirectorQueryOptions = a.InferInput<typeof spamUrlRedirectorQueryOptionsSchema>
