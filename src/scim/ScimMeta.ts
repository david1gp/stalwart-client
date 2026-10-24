/**
 * SCIM resource `meta` attribute (RFC 7643 §3.1;
 * `crates/scim-proto/src/schema/mod.rs`).
 */
export type ScimMeta = {
  resourceType?: string
  created?: string
  lastModified?: string
  location?: string
  version?: string
}
