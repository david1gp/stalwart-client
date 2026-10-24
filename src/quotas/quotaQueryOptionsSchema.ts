import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `Quota/query` arguments (`crates/jmap/src/quota/query.rs`). */
export const quotaQueryOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  filter: a.optional(a.record(a.string(), a.unknown())),
  sort: a.optional(a.array(a.record(a.string(), a.unknown()))),
  position: a.optional(a.number()),
  limit: a.optional(a.number()),
  calculateTotal: a.optional(a.boolean()),
})

export type QuotaQueryOptions = a.InferInput<typeof quotaQueryOptionsSchema>
