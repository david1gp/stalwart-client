import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapCopyResponse } from "../jmap/jmapCopyResponse.js"
import { fileNodeAccountIdResolve } from "./fileNodeAccountIdResolve.js"
import { fileNodeCopyOptionsSchema, type FileNodeCopyOptions } from "./fileNodeCopyOptionsSchema.js"
import type { FileNode } from "./FileNode.js"

/**
 * `FileNode/copy` — copy file nodes between accounts (`create` maps new ids
 * to the source node reference, e.g. `{"f1": {"id": "<sourceId>"}}`).
 */
export async function fileNodeCopy(options: FileNodeCopyOptions): PromiseResult<JmapCopyResponse<FileNode>> {
  const op = "fileNodeCopy"
  const parsed = a.safeParse(fileNodeCopyOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await fileNodeAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  const response = await stalwartMethodCall<JmapCopyResponse<FileNode>>({
    config: parsed.output.config,
    session: resolved.data.session,
    methodName: "FileNode/copy",
    arguments: bodyOmitUndefined({
      accountId: resolved.data.accountId,
      fromAccountId: parsed.output.fromAccountId ?? resolved.data.accountId,
      create: parsed.output.create,
      onSuccessDestroyOriginal: parsed.output.onSuccessDestroyOriginal,
    }),
  })
  if (!response.success) return response
  if (response.data.notCreated !== undefined && Object.keys(response.data.notCreated).length > 0) {
    return createResultError(
      op,
      `FileNode copy partially failed: ${JSON.stringify(response.data.notCreated)}`,
      JSON.stringify(response.data),
    )
  }
  return createResult(response.data)
}
