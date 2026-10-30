import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * `CalendarEvent/query` arguments. Filter keys
 * (`inCalendar`/`after`/`before`/`text`/`title`/`description`/`location`/
 * `owner`/`participant`/`uid` plus the six metadata conditions) and
 * comparators (`id`/`start`/`uid`/`created`/`updated`) per
 * `crates/jmap-proto/src/object/calendar_event.rs` (v1 renamed the
 * `attendee` filter to `participant` and replaced the `recurrenceId`
 * comparator with `id`); query extras `expandRecurrences`/`timeZone`.
 * An unknown `timeZone` fails the call with an invalid-argument error.
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
