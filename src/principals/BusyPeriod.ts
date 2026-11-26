import type { CalendarEvent } from "../calendarEvents/CalendarEvent.js"

/**
 * One busy interval from `Principal/getAvailability`
 * (`crates/jmap-proto/src/method/availability.rs:36-43`).
 * `accountId` is the calendar account that contributed the projected `event`
 * (populated in `crates/jmap/src/principal/availability.rs:395-403`; absent
 * on merged free/busy timeline intervals with no `event` details).
 */
export type BusyPeriod = {
  utcStart: string
  utcEnd: string
  busyStatus?: "confirmed" | "tentative" | "unavailable"
  event?: CalendarEvent | null
  accountId?: string
}
