/**
 * A JMAP ParticipantIdentity (draft-ietf-jmap-calendars).
 * Wire properties per
 * `crates/jmap-proto/src/object/participant_identity.rs:18-24`.
 * `ParticipantIdentity/set` accepts `onSuccessSetIsDefault`
 * (`participant_identity.rs:89-110`).
 */
export type ParticipantIdentity = {
  id: string
  name?: string
  calendarAddress?: string
  isDefault?: boolean
  [key: string]: unknown
}
