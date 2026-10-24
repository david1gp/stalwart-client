import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistryMetrics } from "../generated/RegistryMetrics.js"
import { type MetricsGetOptions, metricsGetOptionsSchema } from "./metricsGetOptionsSchema.js"

/**
 * `x:Metrics/get` — fetch the metrics collection singleton
 * (OpenTelemetry + Prometheus export config). The `x:Metrics/CollectorOtel`
 * and `x:Metrics/CollectorPrometheus` views ride on this object.
 */
export async function metricsGet(options: MetricsGetOptions): PromiseResult<JmapGetResponse<RegistryMetrics>> {
  const op = "metricsGet"
  const parsed = a.safeParse(metricsGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryGet({ config, objectType: "Metrics", ...args })
}
