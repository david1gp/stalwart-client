import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapQueryChangesResponse } from "../jmap/jmapQueryChangesResponse.js"
import { fileNodeAccountIdResolve } from "./fileNodeAccountIdResolve.js"
import {
  fileNodeQueryChangesOptionsSchema,
  type FileNodeQueryChangesOptions,
} from "./fileNodeQueryChangesOptionsSchema.js"

/**
 * `FileNode/queryChanges` — poll query-result changes since `sinceQueryState`
 * (usually the `queryState` from a `FileNode/query`).
 */
export async function fileNodeQueryChanges(
  options: FileNodeQueryChangesOptions,
): PromiseResult<JmapQueryChangesResponse> {
  const op = "fileNodeQueryChanges"
  const parsed = a.safeParse(fileNodeQueryChangesOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await fileNodeAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapQueryChangesResponse>({
    config: parsed.output.config,
    session: resolved.data.session,
    methodName: "FileNode/queryChanges",
    arguments: bodyOmitUndefined({
      accountId: resolved.data.accountId,
      sinceQueryState: parsed.output.sinceQueryState,
      filter: parsed.output.filter,
      sort: parsed.output.sort,
      maxChanges: parsed.output.maxChanges,
      calculateTotal: parsed.output.calculateTotal,
    }),
  })
}
