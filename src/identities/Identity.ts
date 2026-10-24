import type { EmailAddress } from "../emails/EmailAddress.js"

/** A JMAP Identity (RFC 8621 §7; Stalwart `crates/jmap-proto/src/object/identity.rs`). */
export type Identity = {
  id: string
  name?: string
  email?: string
  replyTo?: readonly EmailAddress[]
  bcc?: readonly EmailAddress[]
  textSignature?: string
  htmlSignature?: string
  mayDelete?: boolean
}
