/**
 * SCIM `BulkResponse` (RFC 7644 §3.7; `crates/scim-proto/src/message/bulk.rs`).
 *
 * One entry per request operation, in request order. `status` is the per-entry
 * HTTP status, serialized by Stalwart as a **string** (`"200"`); both string
 * and numeric forms are accepted. A failed entry carries its SCIM error in
 * `response`; `location` points at the created/replaced resource.
 */
import type { ScimError } from "./ScimError.js"
export type ScimBulkOperationResponse = {
  method?: "POST" | "PUT" | "PATCH" | "DELETE"
  bulkId?: string
  version?: string
  location?: string
  status?: string | number
  response?: ScimError
}

export type ScimBulkResponse = {
  schemas: string[]
  Operations: ScimBulkOperationResponse[]
}
