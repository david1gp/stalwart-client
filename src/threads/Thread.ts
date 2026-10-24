/** A JMAP Thread (RFC 8621 §3; Stalwart `crates/jmap-proto/src/object/thread.rs`). */
export type Thread = {
  id: string
  emailIds?: readonly string[]
}
