import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `PushSubscription/set` arguments (`crates/jmap/src/push/set.rs`). */
export const pushSubscriptionSetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  create: a.optional(a.record(a.string(), a.record(a.string(), a.unknown()))),
  update: a.optional(a.record(a.string(), a.record(a.string(), a.unknown()))),
  destroy: a.optional(a.array(a.string())),
})

export type PushSubscriptionSetOptions = a.InferInput<typeof pushSubscriptionSetOptionsSchema>
