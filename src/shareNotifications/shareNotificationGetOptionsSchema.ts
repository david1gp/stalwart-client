import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `ShareNotification/get` arguments. */
export const shareNotificationGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  ids: a.optional(a.array(a.string())),
  properties: a.optional(a.array(a.string())),
})

export type ShareNotificationGetOptions = a.InferInput<typeof shareNotificationGetOptionsSchema>
