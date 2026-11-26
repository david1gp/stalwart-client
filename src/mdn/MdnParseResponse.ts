import type { Mdn } from "./Mdn.js"

/**
 * `MDN/parse` response (`crates/jmap-proto/src/method/mdn.rs:53-69`): blob id →
 * the parsed MDN, plus blob ids that were not parsable or not found. Empty
 * collections are omitted on the wire, hence optional here. `notFound` stays
 * `readonly unknown[]`: request ids deserialize as `MaybeInvalid<BlobId>` so
 * the server echoes invalid entries as-is instead of narrowing to strings;
 * `notParsable` holds only valid ids that failed to parse, hence `string[]`.
 */
export type MdnParseResponse = {
  accountId: string | number
  parsed?: Record<string, Mdn>
  notParsable?: readonly string[]
  notFound?: readonly unknown[]
}
