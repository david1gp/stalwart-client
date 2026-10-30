import type { EmailAddress } from "./EmailAddress.js"

/** A JMAP Email (RFC 8621 §4.1; Stalwart `crates/jmap-proto/src/object/email.rs`). */
export type Email = {
  id: string
  blobId?: string
  threadId?: string
  mailboxIds?: Record<string, boolean>
  keywords?: Record<string, boolean>
  size?: number
  receivedAt?: string
  messageId?: readonly string[]
  inReplyTo?: readonly string[]
  references?: readonly string[]
  sender?: readonly EmailAddress[]
  from?: readonly EmailAddress[]
  to?: readonly EmailAddress[]
  cc?: readonly EmailAddress[]
  bcc?: readonly EmailAddress[]
  replyTo?: readonly EmailAddress[]
  subject?: string
  sentAt?: string
  hasAttachment?: boolean
  preview?: string
  bodyStructure?: unknown
  bodyValues?: Record<string, { value?: string; isEncodingProblem?: boolean; isTruncated?: boolean }>
  textBody?: readonly unknown[]
  htmlBody?: readonly unknown[]
  attachments?: readonly unknown[]
  /** Shared metadata namespaces (draft-ietf-jmap-metadata; needs the metadata capability in `using`). */
  metadata?: Record<string, unknown>
  /** Private metadata, visible only to the requesting user. */
  privateMetadata?: Record<string, unknown>
}
