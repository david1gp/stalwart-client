/**
 * A JMAP Principal (draft-ietf-jmap-calendars + RFC 8620 §5).
 * Wire properties per `crates/jmap-proto/src/object/principal.rs:48-121`
 * (note the wire name `timeZone`, not `timezone`).
 */
export type Principal = {
  id: string
  type?: "individual" | "group" | "resource" | "location" | "other"
  name?: string
  description?: string | null
  email?: string
  timeZone?: string | null
  capabilities?: Record<string, unknown>
  accounts?: Record<string, unknown>
  [key: string]: unknown
}
