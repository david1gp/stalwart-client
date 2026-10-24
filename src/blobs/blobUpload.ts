import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { blobAccountIdResolve } from "./blobAccountIdResolve.js"
import { blobUploadOptionsSchema, type BlobUploadOptions } from "./blobUploadOptionsSchema.js"

/** `Blob/upload` response (`BlobUploadResponse`, `crates/jmap-proto/src/method/upload.rs`). */
export type BlobUploadResult = {
  accountId: string | number
  created?: Record<string, { id: string; type?: string; size: number }>
  notCreated?: Record<string, { type: string; description?: string }>
}

/**
 * `Blob/upload` — method-form upload with inline data (distinct from the raw
 * `POST /jmap/upload` transport wrapped by `blobHttpUpload`).
 */
export async function blobUpload(options: BlobUploadOptions): PromiseResult<BlobUploadResult> {
  const op = "blobUpload"
  const parsed = a.safeParse(blobUploadOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await blobAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  const response = await stalwartMethodCall<BlobUploadResult>({
    config: parsed.output.config,
    session: resolved.data.session,
    methodName: "Blob/upload",
    arguments: {
      accountId: resolved.data.accountId,
      create: parsed.output.create,
    },
  })
  if (!response.success) return response
  if (response.data.notCreated !== undefined && Object.keys(response.data.notCreated).length > 0) {
    return createResultError(
      op,
      `Blob upload partially failed: ${JSON.stringify(response.data.notCreated)}`,
      JSON.stringify(response.data),
    )
  }
  return createResult(response.data)
}
