import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `ShareNotification/changes` arguments. */
export const shareNotificationChangesOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  sinceState: a.string(),
  maxChanges: a.optional(a.number()),
})

export type ShareNotificationChangesOptions = a.InferInput<typeof shareNotificationChangesOptionsSchema>
