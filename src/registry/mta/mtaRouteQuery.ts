import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { mtaRouteQueryOptionsSchema, type MtaRouteQueryOptions } from "./mtaRouteQueryOptionsSchema.js"

/**
 * `x:MtaRoute/query` — list routing rule for outbound message delivery ids with an optional filter/sort/page.
 */
export async function mtaRouteQuery(options: MtaRouteQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "mtaRouteQuery"
  const parsed = a.safeParse(mtaRouteQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "MtaRoute" })
}
