import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapGetResponse } from "../jmap/jmapGetResponse.js"
import { fileNodeAccountIdResolve } from "./fileNodeAccountIdResolve.js"
import { fileNodeGetOptionsSchema, type FileNodeGetOptions } from "./fileNodeGetOptionsSchema.js"
import type { FileNode } from "./FileNode.js"

/** `FileNode/get` — fetch file nodes by id. */
export async function fileNodeGet(options: FileNodeGetOptions): PromiseResult<JmapGetResponse<FileNode>> {
  const op = "fileNodeGet"
  const parsed = a.safeParse(fileNodeGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await fileNodeAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapGetResponse<FileNode>>({
    config: parsed.output.config,
    session: resolved.data.session,
    methodName: "FileNode/get",
    arguments: bodyOmitUndefined({
      accountId: resolved.data.accountId,
      ids: parsed.output.ids,
      properties: parsed.output.properties,
    }),
  })
}
