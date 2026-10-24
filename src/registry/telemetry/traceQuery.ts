import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { type TraceQueryOptions, traceQueryOptionsSchema } from "./traceQueryOptionsSchema.js"

/**
 * `x:Trace/query` — list message delivery trace ids (enterprise-only).
 * Supported filters
 * (`crates/jmap/src/registry/mapping/telemetry.rs:206-320`): `timestamp`
 * (plus `IsGreaterThan`, `IsGreaterThanOrEqual`, `IsLessThan`,
 * `IsLessThanOrEqual` variants, UTC date-time strings), `event` (event type
 * name), `queueId` and `text` (keyword search). Sort by `id` or `timestamp`.
 */
export async function traceQuery(options: TraceQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "traceQuery"
  const parsed = a.safeParse(traceQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryQuery({ config, objectType: "Trace", ...args })
}
