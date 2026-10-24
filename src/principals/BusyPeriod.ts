import type { CalendarEvent } from "../calendarEvents/CalendarEvent.js"

/**
 * One busy interval from `Principal/getAvailability`
 * (`crates/jmap-proto/src/method/availability.rs:35-41`).
 */
export type BusyPeriod = {
  utcStart: string
  utcEnd: string
  busyStatus?: "confirmed" | "tentative" | "unavailable"
  event?: CalendarEvent | null
}
