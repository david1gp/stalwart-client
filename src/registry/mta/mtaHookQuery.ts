import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { mtaHookQueryOptionsSchema, type MtaHookQueryOptions } from "./mtaHookQueryOptionsSchema.js"

/**
 * `x:MtaHook/query` — list MTA hook endpoint for message processing ids with an optional filter/sort/page.
 */
export async function mtaHookQuery(options: MtaHookQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "mtaHookQuery"
  const parsed = a.safeParse(mtaHookQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "MtaHook" })
}
