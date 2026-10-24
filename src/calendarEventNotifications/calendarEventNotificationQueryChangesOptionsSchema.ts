import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `CalendarEventNotification/queryChanges` arguments. */
export const calendarEventNotificationQueryChangesOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  sinceQueryState: a.string(),
  maxChanges: a.optional(a.pipe(a.number(), a.integer(), a.minValue(0))),
})

export type CalendarEventNotificationQueryChangesOptions = a.InferInput<
  typeof calendarEventNotificationQueryChangesOptionsSchema
>
