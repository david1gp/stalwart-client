import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { queuedMessageQueryOptionsSchema, type QueuedMessageQueryOptions } from "./queuedMessageQueryOptionsSchema.js"

/**
 * `x:QueuedMessage/query` — list queued email message pending delivery ids with an optional filter/sort/page.
 */
export async function queuedMessageQuery(options: QueuedMessageQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "queuedMessageQuery"
  const parsed = a.safeParse(queuedMessageQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "QueuedMessage" })
}
