import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import {
  mtaOutboundThrottleQueryOptionsSchema,
  type MtaOutboundThrottleQueryOptions,
} from "./mtaOutboundThrottleQueryOptionsSchema.js"

/**
 * `x:MtaOutboundThrottle/query` — list outbound rate limit rule for message delivery ids with an optional filter/sort/page.
 */
export async function mtaOutboundThrottleQuery(
  options: MtaOutboundThrottleQueryOptions,
): PromiseResult<JmapQueryResponse> {
  const op = "mtaOutboundThrottleQuery"
  const parsed = a.safeParse(mtaOutboundThrottleQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "MtaOutboundThrottle" })
}
