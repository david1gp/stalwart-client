import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import {
  mtaTlsStrategyQueryOptionsSchema,
  type MtaTlsStrategyQueryOptions,
} from "./mtaTlsStrategyQueryOptionsSchema.js"

/**
 * `x:MtaTlsStrategy/query` — list TLS security strategy for outbound connections ids with an optional filter/sort/page.
 */
export async function mtaTlsStrategyQuery(options: MtaTlsStrategyQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "mtaTlsStrategyQuery"
  const parsed = a.safeParse(mtaTlsStrategyQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "MtaTlsStrategy" })
}
