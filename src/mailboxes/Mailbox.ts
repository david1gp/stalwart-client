/** A JMAP Mailbox (RFC 8621 §2; Stalwart `crates/jmap-proto/src/object/mailbox.rs`). */
export type Mailbox = {
  id: string
  name?: string
  parentId?: string | null
  /** Special-use role such as `inbox`, `sent`, `drafts`, `trash` or `junk` (`types/src/special_use.rs`). */
  role?: string | null
  sortOrder?: number
  totalEmails?: number
  unreadEmails?: number
  totalThreads?: number
  unreadThreads?: number
  myRights?: {
    mayReadItems?: boolean
    mayAddItems?: boolean
    mayRemoveItems?: boolean
    maySetSeen?: boolean
    maySetKeywords?: boolean
    mayCreateChild?: boolean
    mayRename?: boolean
    maySubmit?: boolean
    mayDelete?: boolean
    mayShare?: boolean
    maySetMetadata?: boolean
  }
  isSubscribed?: boolean
  /** Shared metadata namespaces (draft-ietf-jmap-metadata; needs the metadata capability in `using`). */
  metadata?: Record<string, unknown>
  /** Private metadata, visible only to the requesting user. */
  privateMetadata?: Record<string, unknown>
}
