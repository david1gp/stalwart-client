import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `Quota/get` arguments (`crates/jmap/src/quota/get.rs`). */
export const quotaGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  ids: a.optional(a.array(a.string())),
  properties: a.optional(a.array(a.string())),
})

export type QuotaGetOptions = a.InferInput<typeof quotaGetOptionsSchema>
