/**
 * `POST /api/calendar/rsvp` response (`RsvpResponse`,
 * `crates/groupware/src/calendar/itip.rs:1107`): either the invitation details
 * for a bare token, the recorded participation status, or a typed error.
 */
export type CalendarRsvpResponse =
  | {
      type: "invitation"
      kind: string
      summary?: string
      description?: string
      location?: string
      when?: string
      recurrence?: string
      attendee: { email?: string; name?: string; partstat?: string }
      attendees: { email?: string; name?: string; partstat?: string }[]
      partstat: string
      language: string
      dir: string
    }
  | { type: "recorded"; partstat: string }
  | {
      type: "error"
      reason:
        | "invalidLink"
        | "invalidPartStat"
        | "expired"
        | "eventNotFound"
        | "notParticipant"
        | "serverError"
        | string
      title: string
      message: string
      language: string
      dir: string
    }
