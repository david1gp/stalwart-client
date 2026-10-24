import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { mtaQueueQuotaQueryOptionsSchema, type MtaQueueQuotaQueryOptions } from "./mtaQueueQuotaQueryOptionsSchema.js"

/**
 * `x:MtaQueueQuota/query` — list quota rule for message queues ids with an optional filter/sort/page.
 */
export async function mtaQueueQuotaQuery(options: MtaQueueQuotaQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "mtaQueueQuotaQuery"
  const parsed = a.safeParse(mtaQueueQuotaQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "MtaQueueQuota" })
}
