import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/**
 * Options for `spamTrainingSampleQuery`. The server only honors the
 * `accountId` filter (anything else is an `unsupportedFilter` error) and only
 * `id` sorting. Source: `crates/jmap/src/registry/mapping/spam_sample.rs`.
 */
export const spamTrainingSampleQueryOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  filter: a.optional(a.object({ accountId: a.optional(a.string()) })),
  sort: a.optional(a.array(a.object({ property: a.string(), isAscending: a.optional(a.boolean()) }))),
  position: a.optional(a.pipe(a.number(), a.integer())),
  anchor: a.optional(a.string()),
  anchorOffset: a.optional(a.pipe(a.number(), a.integer())),
  limit: a.optional(a.pipe(a.number(), a.integer(), a.minValue(0))),
  calculateTotal: a.optional(a.boolean()),
  accountId: a.optional(a.string()),
})

export type SpamTrainingSampleQueryOptions = a.InferInput<typeof spamTrainingSampleQueryOptionsSchema>
