import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapGetResponse } from "../jmap/jmapGetResponse.js"
import { blobAccountIdResolve } from "./blobAccountIdResolve.js"
import { blobGetOptionsSchema, type BlobGetOptions } from "./blobGetOptionsSchema.js"
import type { Blob } from "./Blob.js"

/**
 * `Blob/get` — fetch blob contents inline (default properties `id`, `data`,
 * `size`; `crates/jmap/src/blob/get.rs`).
 */
export async function blobGet(options: BlobGetOptions): PromiseResult<JmapGetResponse<Blob>> {
  const op = "blobGet"
  const parsed = a.safeParse(blobGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await blobAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapGetResponse<Blob>>({
    config: parsed.output.config,
    session: resolved.data.session,
    methodName: "Blob/get",
    arguments: bodyOmitUndefined({
      accountId: resolved.data.accountId,
      ids: parsed.output.ids,
      properties: parsed.output.properties,
    }),
  })
}
