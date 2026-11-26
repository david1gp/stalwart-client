import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * `Principal/getAvailability` arguments
 * (`crates/jmap-proto/src/method/availability.rs:18-26`).
 * `eventProperties` accepts any JSCalendar property name: the server builds a
 * `ProjectionRequest` from it (`crates/jmap/src/principal/availability.rs:153-165`)
 * with the same rules as `CalendarEvent/get` (`crates/jmap/src/calendar_event/get.rs:342-410`
 * — `id`, `baseEventId`, `calendarIds` and friends are JMAP-side properties,
 * anything else projects JSCalendar fields; `utcStart`/`utcEnd` cannot be
 * combined with `recurrenceOverrides`). Properties only take effect with
 * `showDetails: true` on a readable public event.
 */
export const principalGetAvailabilityOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  id: a.string(),
  utcStart: a.string(),
  utcEnd: a.string(),
  showDetails: a.optional(a.boolean()),
  eventProperties: a.optional(a.array(a.string())),
})

export type PrincipalGetAvailabilityOptions = a.InferInput<typeof principalGetAvailabilityOptionsSchema>
