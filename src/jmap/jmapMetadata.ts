import { jmapCapabilities } from "./jmapCapabilities.js"

/**
 * JMAP Object Metadata (draft-ietf-jmap-metadata-04; Stalwart v1).
 *
 * Metadata is not a JMAP method: `metadata` and `privateMetadata` are
 * properties of Email, Mailbox, SieveScript, Calendar, CalendarEvent,
 * AddressBook, ContactCard and FileNode
 * (`crates/jmap-proto/src/object/metadata.rs`, `property_names!` macro).
 * Requesting them (or filtering on them) requires
 * `urn:ietf:params:jmap:metadata` in the call's `using` array — add it with
 * `jmapMetadataUsing`, since per-object `using` derivation only adds the
 * object's own capability.
 */

/** Shared (`metadata`) vs user-private (`privateMetadata`) namespace root. */
export type JmapMetadataRoot = "metadata" | "privateMetadata"

/**
 * `{path, value}` argument for the four metadata text filter conditions
 * (`metadata.rs` `FilterArgumentVisitor::visit_map`).
 */
export type JmapMetadataTextMatch = {
  path: string
  value: string
}

/**
 * The six metadata query filter conditions (`MetadataFilter::try_deserialize`).
 * Exists conditions take a metadata path string; text conditions take a
 * `JmapMetadataTextMatch`. Merge into any object query `filter`.
 */
export type JmapMetadataFilter = {
  metadataExists?: string
  privateMetadataExists?: string
  metadataTextContains?: JmapMetadataTextMatch
  privateMetadataTextContains?: JmapMetadataTextMatch
  metadataTextEquals?: JmapMetadataTextMatch
  privateMetadataTextEquals?: JmapMetadataTextMatch
}

/** Per-data-type metadata support, as advertised in the session capabilities. */
export type JmapDataTypeMetadataInfo = {
  namespaces: readonly string[]
  supportsVendorNamespaces: boolean
  supportsPrivate: boolean
  maxDepth?: number
}

/** Session `urn:ietf:params:jmap:metadata` capability value. */
export type JmapMetadataCapabilities = {
  dataTypes: Record<string, JmapDataTypeMetadataInfo>
}

/**
 * Append the metadata capability URN to a `using` array (deduped), for calls
 * that request `metadata`/`privateMetadata` properties or filter on them.
 */
export function jmapMetadataUsing(using: readonly string[] = []): string[] {
  return using.includes(jmapCapabilities.metadata) ? [...using] : [...using, jmapCapabilities.metadata]
}
