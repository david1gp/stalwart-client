import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import {
  type IndexQueueStatusQueryOptions,
  indexQueueStatusQueryOptionsSchema,
} from "./indexQueueStatusQueryOptionsSchema.js"

/**
 * `x:IndexQueueStatus/query` — list index queue ids with an optional
 * filter/sort/page. Filter by `index` and/or `partition`.
 */
export async function indexQueueStatusQuery(options: IndexQueueStatusQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "indexQueueStatusQuery"
  const parsed = a.safeParse(indexQueueStatusQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryQuery({ config, objectType: "IndexQueueStatus", ...args })
}
