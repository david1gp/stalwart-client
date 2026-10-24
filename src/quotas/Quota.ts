/**
 * A `Quota` object (RFC 8620 §7; properties in
 * `crates/jmap-proto/src/object/quota.rs`).
 */
export type Quota = {
  id: string
  resourceType?: string
  used?: number
  warnLimit?: number | null
  softLimit?: number | null
  hardLimit?: number | null
  scope?: string
  name?: string
  description?: string
  types?: readonly string[]
}
