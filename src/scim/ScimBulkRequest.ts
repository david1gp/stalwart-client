/**
 * SCIM `BulkRequest` (RFC 7644 §3.7; `crates/scim-proto/src/message/bulk.rs`).
 *
 * The wire body is `{schemas: ["...BulkRequest"], failOnErrors?,
 * Operations: [...]}` with a capital `O`. Each operation's `path` is the
 * resource path (e.g. `/Users`, `/Users/{id}`); `bulkId` cross-references
 * creations within the same request (`bulkId:<id>`). `POST`/`PUT`/`PATCH`
 * operations carry `data`; `DELETE` carries none. The server caps the
 * operation count and payload size (`maxOperations`, `maxPayloadSize` — see
 * `ScimServiceProviderConfig`).
 */
export type ScimBulkOperation = {
  method: "POST" | "PUT" | "PATCH" | "DELETE"
  path: string
  bulkId?: string
  version?: string
  data?: unknown
}

export type ScimBulkRequest = {
  schemas?: string[]
  failOnErrors?: number
  Operations: ScimBulkOperation[]
}
