import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * `CalendarEvent/query` arguments. Filter keys
 * (`inCalendar`/`after`/`before`/`text`/`title`/`description`/`location`/
 * `owner`/`attendee`/`uid`) and comparators
 * (`start`/`uid`/`recurrenceId`/`created`/`updated`) per
 * `crates/jmap-proto/src/object/calendar_event.rs:81-104,125-202`;
 * query extras `expandRecurrences`/`timeZone` per `calendar_event.rs:119-123`.
 */
export const calendarEventQueryOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  filter: a.optional(a.record(a.string(), a.unknown())),
  sort: a.optional(a.array(a.object({ property: a.string(), isAscending: a.optional(a.boolean()) }))),
  position: a.optional(a.pipe(a.number(), a.integer())),
  anchor: a.optional(a.string()),
  anchorOffset: a.optional(a.pipe(a.number(), a.integer())),
  limit: a.optional(a.pipe(a.number(), a.integer(), a.minValue(0))),
  calculateTotal: a.optional(a.boolean()),
  expandRecurrences: a.optional(a.boolean()),
  timeZone: a.optional(a.string()),
})

export type CalendarEventQueryOptions = a.InferInput<typeof calendarEventQueryOptionsSchema>
