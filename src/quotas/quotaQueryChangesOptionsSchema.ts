import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `Quota/queryChanges` arguments. */
export const quotaQueryChangesOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  sinceQueryState: a.string(),
  filter: a.optional(a.record(a.string(), a.unknown())),
  sort: a.optional(a.array(a.record(a.string(), a.unknown()))),
  maxChanges: a.optional(a.number()),
  calculateTotal: a.optional(a.boolean()),
})

export type QuotaQueryChangesOptions = a.InferInput<typeof quotaQueryChangesOptionsSchema>
