import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `PushSubscription/get` arguments (RFC 8620 §7.2). */
export const pushSubscriptionGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  ids: a.optional(a.array(a.string())),
  properties: a.optional(a.array(a.string())),
})

export type PushSubscriptionGetOptions = a.InferInput<typeof pushSubscriptionGetOptionsSchema>
