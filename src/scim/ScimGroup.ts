/**
 * SCIM `Group` resource (RFC 7643 §4.2; `crates/scim-proto/src/schema/group.rs`).
 *
 * Stalwart stores Groups as registry `Account` objects and only supports
 * `User` members: `members[].value` is the member's account id and `type`
 * must be `"User"` when present. `displayName` is required on create/replace
 * and unique server-wide (`crates/scim/src/error.rs` maps a duplicate to a
 * `uniqueness` SCIM error).
 */
import type { ScimMeta } from "./ScimMeta.js"
export type ScimGroupMember = {
  value?: string
  $ref?: string
  display?: string
  type?: string
}

export type ScimGroup = {
  schemas?: string[]
  id?: string
  externalId?: string
  displayName?: string
  members?: ScimGroupMember[]
  meta?: ScimMeta
  [extension: string]: unknown
}
