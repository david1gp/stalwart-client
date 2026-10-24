import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * `CalendarEvent/get` arguments. Get extras per
 * `crates/jmap-proto/src/object/calendar_event.rs:106-123`.
 */
export const calendarEventGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  ids: a.optional(a.array(a.string())),
  properties: a.optional(a.array(a.string())),
  recurrenceOverridesBefore: a.optional(a.string()),
  recurrenceOverridesAfter: a.optional(a.string()),
  reduceParticipants: a.optional(a.boolean()),
  timeZone: a.optional(a.string()),
})

export type CalendarEventGetOptions = a.InferInput<typeof calendarEventGetOptionsSchema>
