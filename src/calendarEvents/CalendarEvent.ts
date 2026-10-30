type CalendarEventParticipant = {
  name?: string
  email?: string
  calendarUri?: string | null
  kind?: string
  role?: string
  participationStatus?: string
  expectReply?: boolean
  [key: string]: unknown
}

/**
 * A JSCalendar event (draft-ietf-jmap-calendars).
 * Stalwart stores the full `JSCalendarProperty` set
 * (`crates/jmap-proto/src/object/calendar_event.rs:23-45`); the fields
 * below are the commonly used ones and the object stays open for the rest.
 * `CalendarEvent/get` accepts `recurrenceOverridesBefore/After`,
 * `reduceParticipants` and `timeZone`
 * (`calendar_event.rs:106-123`); `CalendarEvent/set` accepts
 * `sendSchedulingMessages` (`calendar_event.rs:114-118`); `CalendarEvent/query`
 * accepts `expandRecurrences` and `timeZone`
 * (`calendar_event.rs:119-123`).
 */
export type CalendarEvent = {
  id: string
  baseEventId?: string | null
  calendarIds?: Record<string, boolean>
  uid?: string
  title?: string
  description?: string | null
  start?: string
  timeZone?: string | null
  duration?: string
  status?: string
  freeBusyStatus?: string
  participants?: Record<string, CalendarEventParticipant>
  locations?: Record<string, unknown> | null
  links?: Record<string, unknown> | null
  recurrenceRules?: Record<string, unknown> | null
  excludedRecurrenceRules?: Record<string, unknown> | null
  recurrenceOverrides?: Record<string, CalendarEvent | null> | null
  replyTo?: Record<string, string> | null
  method?: string
  created?: string
  updated?: string
  /** Shared metadata namespaces (draft-ietf-jmap-metadata; needs the metadata capability in `using`). */
  metadata?: Record<string, unknown>
  /** Private metadata, visible only to the requesting user. */
  privateMetadata?: Record<string, unknown>
  [key: string]: unknown
}
