/**
 * SCIM 2.0 error resource (`urn:ietf:params:scim:api:messages:2.0:Error`,
 * RFC 7644 §3.12; `crates/scim-proto/src/message/error.rs`).
 *
 * Stalwart serializes `status` as a **string** (`"status":"403"`) but parses
 * both string and numeric forms, so both are accepted here. `scimType` is one
 * of `invalidFilter tooMany uniqueness mutability invalidSyntax invalidPath
 * noTarget invalidValue invalidVers sensitive invalidCursor expiredCursor
 * invalidCount`.
 */
export type ScimError = {
  schemas: string[]
  status: string | number
  scimType?: string
  detail?: string
}
