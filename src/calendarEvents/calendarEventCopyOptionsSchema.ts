import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * `CalendarEvent/copy` arguments (`crates/jmap-proto/src/method/copy.rs:19-32`).
 * Copying within the same account is refused server-side
 * (`crates/jmap/src/calendar_event/copy.rs:45-49`).
 */
export const calendarEventCopyOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  fromAccountId: a.optional(a.string()),
  ifFromInState: a.optional(a.string()),
  accountId: a.optional(a.string()),
  ifInState: a.optional(a.string()),
  create: a.record(a.string(), a.record(a.string(), a.unknown())),
  onSuccessDestroyOriginal: a.optional(a.boolean()),
  destroyFromIfInState: a.optional(a.string()),
})

export type CalendarEventCopyOptions = a.InferInput<typeof calendarEventCopyOptionsSchema>
