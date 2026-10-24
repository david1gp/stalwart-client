/**
 * SCIM `User` resource (RFC 7643 §4.1; `crates/scim-proto/src/schema/user.rs`).
 *
 * Stalwart stores Users as registry `Account` objects: `userName` maps to the
 * account email address, `active: false` disables the account, and `groups`
 * is read-only server output. The enterprise `User` extension
 * (`urn:ietf:params:scim:schemas:extension:enterprise:2.0:User`) and other
 * tolerated attributes (`password nickName profileUrl title userType
 * phoneNumbers ims photos addresses entitlements roles x509Certificates`)
 * pass through the index signature untouched.
 */
import type { ScimMeta } from "./ScimMeta.js"
export type ScimUserName = {
  formatted?: string
  familyName?: string
  givenName?: string
  middleName?: string
  honorificPrefix?: string
  honorificSuffix?: string
}

export type ScimUserEmail = {
  value?: string
  display?: string
  type?: string
  primary?: boolean
}

export type ScimUserGroupRef = {
  value?: string
  $ref?: string
  display?: string
  type?: string
}

export type ScimUser = {
  schemas?: string[]
  id?: string
  externalId?: string
  userName?: string
  name?: ScimUserName
  displayName?: string
  active?: boolean
  emails?: ScimUserEmail[]
  locale?: string
  preferredLanguage?: string
  timezone?: string
  groups?: ScimUserGroupRef[]
  meta?: ScimMeta
  [extension: string]: unknown
}
