/**
 * A `SieveScript` object (JMAP Sieve draft; properties in
 * `crates/jmap-proto/src/object/sieve.rs:14-27`).
 */
export type SieveScript = {
  id: string
  name?: string
  blobId?: string
  isActive?: boolean
}
