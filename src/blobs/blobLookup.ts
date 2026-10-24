import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { blobAccountIdResolve } from "./blobAccountIdResolve.js"
import { blobLookupOptionsSchema, type BlobLookupOptions } from "./blobLookupOptionsSchema.js"

/** `Blob/lookup` response (`BlobLookupResponse`, `crates/jmap-proto/src/method/lookup.rs`). */
export type BlobLookupResult = {
  accountId: string | number
  list: readonly { id: string; matchedIds: Record<string, readonly string[]> }[]
  notFound: readonly string[]
}

/**
 * `Blob/lookup` — find which objects reference the given blobs. `typeNames`
 * are data types (`Email`, `Mailbox`, …); `matchedIds` maps each type to the
 * referencing object ids.
 */
export async function blobLookup(options: BlobLookupOptions): PromiseResult<BlobLookupResult> {
  const op = "blobLookup"
  const parsed = a.safeParse(blobLookupOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await blobAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  return stalwartMethodCall<BlobLookupResult>({
    config: parsed.output.config,
    session: resolved.data.session,
    methodName: "Blob/lookup",
    arguments: {
      accountId: resolved.data.accountId,
      typeNames: parsed.output.typeNames,
      ids: parsed.output.ids,
    },
  })
}
