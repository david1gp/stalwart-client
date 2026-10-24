import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { jmapDownload } from "../jmap/jmapDownload.js"
import { blobAccountIdResolve } from "./blobAccountIdResolve.js"
import { blobDownloadOptionsSchema, type BlobDownloadOptions } from "./blobDownloadOptionsSchema.js"

/**
 * Blob download via the session `downloadUrl` template
 * (`GET /jmap/download/{accountId}/{blobId}/{name}?accept=`,
 * `request.rs:163`). Resolves to the raw bytes; the CLI renders them as
 * base64 JSON or writes them with `--output`.
 */
export async function blobDownload(options: BlobDownloadOptions): PromiseResult<Uint8Array> {
  const op = "blobDownload"
  const parsed = a.safeParse(blobDownloadOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await blobAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  return jmapDownload({
    config: parsed.output.config,
    accountId: resolved.data.accountId,
    blobId: parsed.output.blobId,
    name: parsed.output.name ?? parsed.output.blobId,
    accept: parsed.output.accept,
    session: resolved.data.session,
  })
}
