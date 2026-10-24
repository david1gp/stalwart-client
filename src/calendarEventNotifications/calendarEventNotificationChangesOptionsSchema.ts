import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `CalendarEventNotification/changes` arguments. */
export const calendarEventNotificationChangesOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  sinceState: a.string(),
  maxChanges: a.optional(a.pipe(a.number(), a.integer(), a.minValue(0))),
})

export type CalendarEventNotificationChangesOptions = a.InferInput<typeof calendarEventNotificationChangesOptionsSchema>
