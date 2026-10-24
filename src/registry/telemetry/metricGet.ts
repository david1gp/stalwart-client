import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistryMetric } from "../generated/RegistryMetric.js"
import { type MetricGetOptions, metricGetOptionsSchema } from "./metricGetOptionsSchema.js"

/**
 * `x:Metric/get` — fetch collected metric data points by id
 * (`Counter`, `Gauge` or `Histogram` variants).
 * Read-only and enterprise-only: `/set` always fails with
 * "Telemetry objects cannot be modified", and on the community edition every
 * method fails with "This feature is only available in the Enterprise edition"
 * (`crates/jmap/src/registry/set.rs`, `crates/jmap/src/registry/mod.rs:20-44`).
 */
export async function metricGet(options: MetricGetOptions): PromiseResult<JmapGetResponse<RegistryMetric>> {
  const op = "metricGet"
  const parsed = a.safeParse(metricGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryGet({ config, objectType: "Metric", ...args })
}
