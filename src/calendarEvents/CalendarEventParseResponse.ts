import type { CalendarEvent } from "./CalendarEvent.js"

/**
 * `CalendarEvent/parse` response: blob id → the JSCalendar entries parsed
 * from the uploaded `.ics` (`crates/jmap-proto/src/method/parse.rs:28-45`,
 * handler at `crates/jmap/src/calendar_event/parse.rs`).
 */
export type CalendarEventParseResponse = {
  accountId: string | number
  parsed?: Record<string, readonly CalendarEvent[]>
  notParsable?: readonly string[]
  notFound?: readonly unknown[]
}
