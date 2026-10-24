/**
 * SCIM query parameters / `SearchRequest` body (RFC 7644 §3.4.2, §3.5.2;
 * `crates/scim-proto/src/message/search.rs`).
 *
 * `GET` collection routes take these as URL query parameters
 * (`filter`, `sortBy`, `sortOrder` (`ascending`|`descending`), `startIndex`
 * (1-based), `count`, `cursor`, comma-separated `attributes` /
 * `excludedAttributes`); the `.search` routes take the same fields as a
 * `POST` JSON body (`.../SearchRequest` schema).
 */
export type ScimSearchRequest = {
  schemas?: string[]
  attributes?: string[]
  excludedAttributes?: string[]
  filter?: string
  sortBy?: string
  sortOrder?: "ascending" | "descending"
  startIndex?: number
  count?: number
  cursor?: string
}
