import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

const calendarEventNotificationPatchSchema = a.record(a.string(), a.unknown())

/**
 * `CalendarEventNotification/set` arguments. Stalwart's
 * `CalendarEventNotification::SetArguments` is `()` — in practice only
 * `destroy` (acknowledging notifications) is meaningful.
 */
export const calendarEventNotificationSetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  ifInState: a.optional(a.string()),
  create: a.optional(a.record(a.string(), calendarEventNotificationPatchSchema)),
  update: a.optional(a.record(a.string(), calendarEventNotificationPatchSchema)),
  destroy: a.optional(a.array(a.string())),
})

export type CalendarEventNotificationSetOptions = a.InferInput<typeof calendarEventNotificationSetOptionsSchema>
