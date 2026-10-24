import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

const calendarEventPatchSchema = a.record(a.string(), a.unknown())

/**
 * `CalendarEvent/set` arguments. `CalendarEventSetArguments`
 * (`crates/jmap-proto/src/object/calendar_event.rs:114-118`) adds
 * `sendSchedulingMessages`.
 */
export const calendarEventSetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  ifInState: a.optional(a.string()),
  create: a.optional(a.record(a.string(), calendarEventPatchSchema)),
  update: a.optional(a.record(a.string(), calendarEventPatchSchema)),
  destroy: a.optional(a.array(a.string())),
  sendSchedulingMessages: a.optional(a.boolean()),
})

export type CalendarEventSetOptions = a.InferInput<typeof calendarEventSetOptionsSchema>
