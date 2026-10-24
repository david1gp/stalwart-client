import type { CalendarEvent } from "../calendarEvents/CalendarEvent.js"

type CalendarEventNotificationChangedBy = {
  name: string
  email?: string
  principalId?: string | null
  calendarAddress?: string | null
  [key: string]: unknown
}

/**
 * A JMAP CalendarEventNotification (draft-ietf-jmap-calendars).
 * Wire shape per
 * `crates/jmap-proto/src/object/calendar_event_notification.rs:22-50`;
 * filter keys `after`/`before`/`type`/`calendarEventIds` and the `created`
 * comparator per `calendar_event_notification.rs:231-245,241-245`.
 */
export type CalendarEventNotification = {
  id: string
  created?: string
  changedBy?: CalendarEventNotificationChangedBy | null
  comment?: string
  type?: "created" | "updated" | "destroyed"
  calendarEventId?: string
  isDraft?: boolean
  event?: CalendarEvent | null
  eventPatch?: CalendarEvent | null
  [key: string]: unknown
}
