import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `CalendarEventNotification/get` arguments. */
export const calendarEventNotificationGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  ids: a.optional(a.array(a.string())),
  properties: a.optional(a.array(a.string())),
})

export type CalendarEventNotificationGetOptions = a.InferInput<typeof calendarEventNotificationGetOptionsSchema>
