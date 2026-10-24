/**
 * SCIM `ListResponse` envelope (RFC 7644 §3.4.2;
 * `crates/scim-proto/src/message/list.rs`).
 *
 * Note the capital `R`: the wire field is `Resources`, not `resources`.
 * Index-paged responses carry `startIndex`; cursor-paged ones carry
 * `nextCursor`/`previousCursor` instead.
 */
export type ScimListResponse<T> = {
  schemas: string[]
  totalResults: number
  itemsPerPage?: number
  startIndex?: number
  nextCursor?: string
  previousCursor?: string
  Resources: T[]
}
