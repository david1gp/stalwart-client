import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `ShareNotification/query` arguments (filter: `after`, `before`, `objectType`, `objectAccountId`). */
export const shareNotificationQueryOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  filter: a.optional(a.record(a.string(), a.unknown())),
  sort: a.optional(a.array(a.record(a.string(), a.unknown()))),
  position: a.optional(a.number()),
  limit: a.optional(a.number()),
  calculateTotal: a.optional(a.boolean()),
})

export type ShareNotificationQueryOptions = a.InferInput<typeof shareNotificationQueryOptionsSchema>
