/** A JMAP VacationResponse (RFC 8621 §9; Stalwart `crates/jmap-proto/src/object/vacation_response.rs`). */
export type VacationResponse = {
  id: string
  isEnabled?: boolean
  fromDate?: string | null
  toDate?: string | null
  subject?: string | null
  textBody?: string | null
  htmlBody?: string | null
}
