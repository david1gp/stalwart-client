/**
 * Schema redirect target (`GET /api/schema` → 302 `/api/schema/{hash}`).
 *
 * `location` is the raw `Location` header; `hash` is its trailing segment.
 */
export interface ManagementSchemaReference {
  hash: string
  location: string
}
