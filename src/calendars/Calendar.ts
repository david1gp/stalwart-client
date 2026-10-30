type CalendarAlert = {
  when?: string
  trigger?: Record<string, unknown>
  offset?: string
  relativeTo?: "start" | "end"
  action?: "display" | "email"
  "@type"?: string
  [key: string]: unknown
}

/**
 * A JMAP Calendar (draft-ietf-jmap-calendars).
 * Wire properties per `crates/jmap-proto/src/object/calendar.rs:26-55`.
 * `Calendar/set` also accepts `onDestroyRemoveEvents` and
 * `onSuccessSetIsDefault` (`calendar.rs:267-292`).
 */
export type Calendar = {
  id: string
  name?: string
  description?: string | null
  color?: string
  sortOrder?: number
  isSubscribed?: boolean
  isVisible?: boolean
  isDefault?: boolean
  includeInAvailability?: "all" | "attending" | "none"
  defaultAlertsWithTime?: readonly CalendarAlert[] | null
  defaultAlertsWithoutTime?: readonly CalendarAlert[] | null
  timeZone?: string | null
  shareWith?: Record<string, readonly string[]>
  myRights?: Record<string, boolean>
  /** Shared metadata namespaces (draft-ietf-jmap-metadata; needs the metadata capability in `using`). */
  metadata?: Record<string, unknown>
  /** Private metadata, visible only to the requesting user. */
  privateMetadata?: Record<string, unknown>
  [key: string]: unknown
}
