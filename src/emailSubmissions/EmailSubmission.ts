import type { EmailAddress } from "../emails/EmailAddress.js"

/** A JMAP EmailSubmission (RFC 8621 §8; Stalwart `crates/jmap-proto/src/object/email_submission.rs`). */
export type EmailSubmission = {
  id: string
  identityId?: string
  emailId?: string
  threadId?: string
  envelope?: {
    mailFrom?: EmailAddress
    rcptTo?: readonly EmailAddress[]
  }
  sendAt?: string
  undoStatus?: string
  deliveryStatus?: Record<string, string>
  dsnBlobIds?: readonly string[]
  mdnBlobIds?: readonly string[]
}
