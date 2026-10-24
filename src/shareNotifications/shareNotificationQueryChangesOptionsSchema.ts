import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `ShareNotification/queryChanges` arguments. */
export const shareNotificationQueryChangesOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  sinceQueryState: a.string(),
  filter: a.optional(a.record(a.string(), a.unknown())),
  sort: a.optional(a.array(a.record(a.string(), a.unknown()))),
  maxChanges: a.optional(a.number()),
  calculateTotal: a.optional(a.boolean()),
})

export type ShareNotificationQueryChangesOptions = a.InferInput<typeof shareNotificationQueryChangesOptionsSchema>
