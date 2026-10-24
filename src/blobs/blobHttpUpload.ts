import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { jmapUpload, type JmapUploadResult } from "../jmap/jmapUpload.js"
import { blobAccountIdResolve } from "./blobAccountIdResolve.js"
import { blobHttpUploadOptionsSchema, type BlobHttpUploadOptions } from "./blobHttpUploadOptionsSchema.js"

/**
 * Raw blob upload via the session `uploadUrl` template
 * (`POST /jmap/upload/{accountId}/`, `request.rs:179`). Returns
 * `{accountId, blobId, type, size}`. Prefer this over `blobUpload` for large
 * payloads; the method form sends data inline in the JMAP call.
 */
export async function blobHttpUpload(options: BlobHttpUploadOptions): PromiseResult<JmapUploadResult> {
  const op = "blobHttpUpload"
  const parsed = a.safeParse(blobHttpUploadOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await blobAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  return jmapUpload({
    config: parsed.output.config,
    accountId: resolved.data.accountId,
    data: parsed.output.data,
    contentType: parsed.output.contentType,
    session: resolved.data.session,
  })
}
