import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapChangesResponse } from "../jmap/jmapChangesResponse.js"
import { fileNodeAccountIdResolve } from "./fileNodeAccountIdResolve.js"
import { fileNodeChangesOptionsSchema, type FileNodeChangesOptions } from "./fileNodeChangesOptionsSchema.js"

/**
 * `FileNode/changes` — poll file node changes since `sinceState` (usually the
 * `state` from a previous `FileNode/get`).
 */
export async function fileNodeChanges(options: FileNodeChangesOptions): PromiseResult<JmapChangesResponse> {
  const op = "fileNodeChanges"
  const parsed = a.safeParse(fileNodeChangesOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await fileNodeAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapChangesResponse>({
    config: parsed.output.config,
    session: resolved.data.session,
    methodName: "FileNode/changes",
    arguments: bodyOmitUndefined({
      accountId: resolved.data.accountId,
      sinceState: parsed.output.sinceState,
      maxChanges: parsed.output.maxChanges,
    }),
  })
}
