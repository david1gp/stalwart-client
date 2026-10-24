import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import {
  mtaConnectionStrategyQueryOptionsSchema,
  type MtaConnectionStrategyQueryOptions,
} from "./mtaConnectionStrategyQueryOptionsSchema.js"

/**
 * `x:MtaConnectionStrategy/query` — list connection strategy for outbound message delivery ids with an optional filter/sort/page.
 */
export async function mtaConnectionStrategyQuery(
  options: MtaConnectionStrategyQueryOptions,
): PromiseResult<JmapQueryResponse> {
  const op = "mtaConnectionStrategyQuery"
  const parsed = a.safeParse(mtaConnectionStrategyQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "MtaConnectionStrategy" })
}
