/**
 * SCIM `ResourceType` definition (RFC 7643 §6; `crates/scim-proto/src/schema/spc.rs`).
 *
 * Stalwart exposes `User` and `Group`. `GET /scim/v2/ResourceTypes` answers a
 * `ScimListResponse` of both; `GET /scim/v2/ResourceTypes/{name}` answers the
 * single definition (`name` is `User` or `Group`, case-sensitive).
 */
import type { ScimMeta } from "./ScimMeta.js"
export type ScimResourceType = {
  schemas: string[]
  id?: string
  name?: string
  description?: string
  endpoint?: string
  schema?: string
  schemaExtensions?: { schema?: string; required?: boolean }[]
  meta?: ScimMeta
}
