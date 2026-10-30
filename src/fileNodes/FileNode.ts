/**
 * A `FileNode` object (JMAP File Storage draft-ietf-jmap-filenode-18;
 * properties in `crates/jmap-proto/src/object/file_node.rs`).
 *
 * Stalwart v1 wire names: the node kind is `@type` (`File`/`Directory`/
 * `SymLink`, capitalized) and the MIME type is `mediaType` — the pre-v1
 * `type`/`nodeType` property names no longer exist (the `nodeType` *filter*
 * key survives).
 */
export type FileNode = {
  id: string
  parentId?: string | null
  blobId?: string | null
  size?: number
  name?: string
  /** Node kind: `File`, `Directory` or `SymLink`. */
  "@type"?: "File" | "Directory" | "SymLink"
  /** MIME type of the node content (files only). */
  mediaType?: string | null
  /** Link target (symlinks only). */
  target?: string | null
  created?: string
  modified?: string
  accessed?: string
  changed?: string
  executable?: boolean
  role?: string | null
  myRights?: Record<string, boolean>
  shareWith?: Record<string, Record<string, boolean>>
  isSubscribed?: boolean
  /** Shared metadata namespaces (draft-ietf-jmap-metadata; needs the metadata capability in `using`). */
  metadata?: Record<string, unknown>
  /** Private metadata, visible only to the requesting user. */
  privateMetadata?: Record<string, unknown>
}
