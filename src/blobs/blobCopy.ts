import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { blobAccountIdResolve } from "./blobAccountIdResolve.js"
import { blobCopyOptionsSchema, type BlobCopyOptions } from "./blobCopyOptionsSchema.js"

/** `Blob/copy` response (`CopyBlobResponse`, `crates/jmap-proto/src/method/copy.rs`). */
export type BlobCopyResult = {
  fromAccountId: string | number
  accountId: string | number
  copied?: Record<string, string>
  notCopied?: Record<string, { type: string; description?: string }>
}

/**
 * `Blob/copy` — copy blobs between accounts. Unlike other copies the response
 * maps old blob ids to new ones (`copied`); failures land in `notCopied`.
 */
export async function blobCopy(options: BlobCopyOptions): PromiseResult<BlobCopyResult> {
  const op = "blobCopy"
  const parsed = a.safeParse(blobCopyOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await blobAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  const response = await stalwartMethodCall<BlobCopyResult>({
    config: parsed.output.config,
    session: resolved.data.session,
    methodName: "Blob/copy",
    arguments: bodyOmitUndefined({
      accountId: resolved.data.accountId,
      fromAccountId: parsed.output.fromAccountId ?? resolved.data.accountId,
      blobIds: parsed.output.blobIds,
    }),
  })
  if (!response.success) return response
  if (response.data.notCopied !== undefined && Object.keys(response.data.notCopied).length > 0) {
    return createResultError(
      op,
      `Blob copy partially failed: ${JSON.stringify(response.data.notCopied)}`,
      JSON.stringify(response.data),
    )
  }
  return createResult(response.data)
}
