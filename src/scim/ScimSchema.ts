/**
 * SCIM `Schema` definition resource (RFC 7643 §7;
 * `crates/scim-proto/src/schema/mod.rs`).
 *
 * Stalwart exposes the `User` and `Group` core schemas.
 * `GET /scim/v2/Schemas` answers a `ScimListResponse` of both;
 * `GET /scim/v2/Schemas/{uri}` answers one schema (the full URN, e.g.
 * `urn:ietf:params:scim:schemas:core:2.0:User`, URL-encoded).
 */
import type { ScimMeta } from "./ScimMeta.js"
export type ScimSchemaAttribute = {
  name?: string
  type?: string
  multiValued?: boolean
  required?: boolean
  caseExact?: boolean
  mutability?: string
  returned?: string
  uniqueness?: string
  description?: string
  canonicalValues?: string[]
  referenceTypes?: string[]
  subAttributes?: ScimSchemaAttribute[]
}

export type ScimSchema = {
  schemas: string[]
  id?: string
  name?: string
  description?: string
  attributes?: ScimSchemaAttribute[]
  meta?: ScimMeta
}
