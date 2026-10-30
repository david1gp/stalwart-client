/**
 * An `AddressBook` object (JMAP Contacts; properties in
 * `crates/jmap-proto/src/object/addressbook.rs`). `shareWith` maps an account
 * id to a map of right names (`mayRead`, `mayWrite`, `mayShare`, `mayDelete`)
 * to booleans (see `crates/jmap/src/api/acl.rs`).
 */
export type AddressBook = {
  id: string
  name?: string
  description?: string | null
  sortOrder?: number
  isDefault?: boolean
  isSubscribed?: boolean
  shareWith?: Record<string, Record<string, boolean>>
  myRights?: Record<string, boolean>
  /** Shared metadata namespaces (draft-ietf-jmap-metadata; needs the metadata capability in `using`). */
  metadata?: Record<string, unknown>
  /** Private metadata, visible only to the requesting user. */
  privateMetadata?: Record<string, unknown>
}
