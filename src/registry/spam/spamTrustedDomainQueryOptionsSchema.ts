import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"
import { registryFilterSchema } from "../registryFilterSchema.js"

/**
 * Options for `spamTrustedDomainQuery` — a `MemoryLookupKey` query pre-filtered to the
 * `trusted-domains` namespace (`resources/schema/schema.json.gz` `x:MemoryLookupKey/SpamTrustedDomain`
 * `filtersStatic`). Extra `filter` fields are merged; `namespace` is forced to `trusted-domains`.
 */
export const spamTrustedDomainQueryOptionsSchema = a.object({
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

export type SpamTrustedDomainQueryOptions = a.InferInput<typeof spamTrustedDomainQueryOptionsSchema>
