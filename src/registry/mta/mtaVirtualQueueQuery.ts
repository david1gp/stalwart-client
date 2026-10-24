import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import {
  mtaVirtualQueueQueryOptionsSchema,
  type MtaVirtualQueueQueryOptions,
} from "./mtaVirtualQueueQueryOptionsSchema.js"

/**
 * `x:MtaVirtualQueue/query` — list virtual queue for organizing outbound message delivery ids with an optional filter/sort/page.
 */
export async function mtaVirtualQueueQuery(options: MtaVirtualQueueQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "mtaVirtualQueueQuery"
  const parsed = a.safeParse(mtaVirtualQueueQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "MtaVirtualQueue" })
}
