import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { jmapSetErrorCheck } from "../jmap/jmapSetErrorCheck.js"
import type { JmapSetResponse } from "../jmap/jmapSetResponse.js"
import { fileNodeAccountIdResolve } from "./fileNodeAccountIdResolve.js"
import { fileNodeSetOptionsSchema, type FileNodeSetOptions } from "./fileNodeSetOptionsSchema.js"
import type { FileNode } from "./FileNode.js"

/**
 * `FileNode/set` — create, update and/or destroy file nodes. A create needs a
 * `name` (1–255 octets, `crates/jmap/src/file/set.rs:844`) and usually a
 * `blobId` uploaded first; sharing uses `shareWith` like address books.
 */
export async function fileNodeSet(options: FileNodeSetOptions): PromiseResult<JmapSetResponse<FileNode>> {
  const op = "fileNodeSet"
  const parsed = a.safeParse(fileNodeSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await fileNodeAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  const response = await stalwartMethodCall<JmapSetResponse<FileNode>>({
    config: parsed.output.config,
    session: resolved.data.session,
    methodName: "FileNode/set",
    arguments: bodyOmitUndefined({
      accountId: resolved.data.accountId,
      ifInState: parsed.output.ifInState,
      create: parsed.output.create,
      update: parsed.output.update,
      destroy: parsed.output.destroy,
    }),
  })
  if (!response.success) return response
  return jmapSetErrorCheck(op, response.data)
}
