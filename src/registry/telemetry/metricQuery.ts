import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { type MetricQueryOptions, metricQueryOptionsSchema } from "./metricQueryOptionsSchema.js"

/**
 * `x:Metric/query` — list collected metric data point ids (enterprise-only).
 * Supported filters
 * (`crates/jmap/src/registry/mapping/telemetry.rs:366-397`): `timestamp`
 * (plus `IsGreaterThan`, `IsGreaterThanOrEqual`, `IsLessThan` and
 * `IsLessThanOrEqual` variants, UTC date-time strings) and `metric`
 * (array of metric type names).
 */
export async function metricQuery(options: MetricQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "metricQuery"
  const parsed = a.safeParse(metricQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryQuery({ config, objectType: "Metric", ...args })
}
