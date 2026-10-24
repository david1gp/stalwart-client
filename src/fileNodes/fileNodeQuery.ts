import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapQueryResponse } from "../jmap/jmapQueryResponse.js"
import { fileNodeAccountIdResolve } from "./fileNodeAccountIdResolve.js"
import { fileNodeQueryOptionsSchema, type FileNodeQueryOptions } from "./fileNodeQueryOptionsSchema.js"

/** `FileNode/query` — list file node ids. */
export async function fileNodeQuery(options: FileNodeQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "fileNodeQuery"
  const parsed = a.safeParse(fileNodeQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await fileNodeAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapQueryResponse>({
    config: parsed.output.config,
    session: resolved.data.session,
    methodName: "FileNode/query",
    arguments: bodyOmitUndefined({
      accountId: resolved.data.accountId,
      filter: parsed.output.filter,
      sort: parsed.output.sort,
      position: parsed.output.position,
      limit: parsed.output.limit,
      calculateTotal: parsed.output.calculateTotal,
    }),
  })
}
