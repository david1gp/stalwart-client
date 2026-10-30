/**
 * A `SieveScript` object (JMAP Sieve draft; properties in
 * `crates/jmap-proto/src/object/sieve.rs:14-27`).
 */
export type SieveScript = {
  id: string
  name?: string
  blobId?: string
  isActive?: boolean
  /** Shared metadata namespaces (draft-ietf-jmap-metadata; needs the metadata capability in `using`). */
  metadata?: Record<string, unknown>
  /** Private metadata, visible only to the requesting user. */
  privateMetadata?: Record<string, unknown>
}
