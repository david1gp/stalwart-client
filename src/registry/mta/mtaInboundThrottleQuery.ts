import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import {
  mtaInboundThrottleQueryOptionsSchema,
  type MtaInboundThrottleQueryOptions,
} from "./mtaInboundThrottleQueryOptionsSchema.js"

/**
 * `x:MtaInboundThrottle/query` — list inbound rate limit rule for SMTP connections ids with an optional filter/sort/page.
 */
export async function mtaInboundThrottleQuery(
  options: MtaInboundThrottleQueryOptions,
): PromiseResult<JmapQueryResponse> {
  const op = "mtaInboundThrottleQuery"
  const parsed = a.safeParse(mtaInboundThrottleQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "MtaInboundThrottle" })
}
