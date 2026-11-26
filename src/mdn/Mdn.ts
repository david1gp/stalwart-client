import type { MdnDisposition } from "./MdnDisposition.js"

/**
 * A JMAP MDN object (RFC 9007 §4.1; Stalwart `crates/jmap-proto/src/object/mdn.rs`).
 * Every field is optional; the server omits absent fields on output and
 * accepts null on input. `includeOriginalMessage` defaults to false
 * server-side and is only serialized when true.
 */
export type Mdn = {
  forEmailId?: string
  subject?: string
  textBody?: string
  includeOriginalMessage?: boolean
  reportingUA?: string
  disposition?: MdnDisposition
  mdnGateway?: string
  originalRecipient?: string
  finalRecipient?: string
  originalMessageId?: string
  error?: readonly string[]
  extensionFields?: Record<string, string>
}
