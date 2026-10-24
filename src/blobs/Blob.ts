/**
 * A `Blob` object as returned by `Blob/get` (`crates/jmap-proto/src/object/blob.rs:19-29`).
 * Which `data:*` / `digest:*` keys appear depends on the requested properties, so
 * extension properties stay open.
 */
export type Blob = {
  id: string
  blobId?: string
  size?: number
  type?: string
  isEncodingProblem?: boolean
  isTruncated?: boolean
  [property: string]: unknown
}
