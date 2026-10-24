import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `Quota/changes` arguments. */
export const quotaChangesOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  sinceState: a.string(),
  maxChanges: a.optional(a.number()),
})

export type QuotaChangesOptions = a.InferInput<typeof quotaChangesOptionsSchema>
