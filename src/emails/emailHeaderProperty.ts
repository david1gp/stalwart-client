/**
 * Build an `Email/get` `header:<name>[:<form>]` property selector
 * (`crates/jmap-proto/src/object/email.rs` `HeaderProperty::parse`).
 *
 * Stalwart v1 parses headers into typed forms: `asText`, `asAddresses`,
 * `asGroupedAddresses`, `asMessageIds`, `asDate` and `asURLs`. The default
 * (no form) returns the raw header value. Each header only admits the forms
 * that fit it (`is_allowed_form`: `Subject` → text, `From`/`To`/… →
 * addresses, `Message-ID`/`References`/… → message ids, `Date` → date).
 */
export type EmailHeaderForm = "asText" | "asAddresses" | "asGroupedAddresses" | "asMessageIds" | "asDate" | "asURLs"

export function emailHeaderProperty(name: string, form?: EmailHeaderForm): string {
  return form === undefined ? `header:${name}` : `header:${name}:${form}`
}
