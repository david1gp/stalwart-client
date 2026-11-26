/** An RFC 9007 §4.1 MDN disposition value (Stalwart `crates/jmap-proto/src/object/mdn.rs`). */
export type MdnDisposition = {
  actionMode: "manual-action" | "automatic-action"
  sendingMode: "mdn-sent-manually" | "mdn-sent-automatically"
  type: "deleted" | "dispatched" | "displayed" | "processed"
}
