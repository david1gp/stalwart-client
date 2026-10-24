/** A JMAP SearchSnippet (RFC 8621 §3.2; Stalwart `crates/jmap-proto/src/object/search_snippet.rs`). */
export type SearchSnippet = {
  emailId: string
  subject?: string | null
  preview?: string | null
}
