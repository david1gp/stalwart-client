import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import { type MetricsPrometheusOptions, metricsPrometheusOptionsSchema } from "./metricsPrometheusOptionsSchema.js"

/**
 * `GET /metrics/prometheus` — Prometheus exposition feed
 * (`text/plain; version=0.0.4`, `crates/http/src/request.rs:600-619`). The
 * arm only exists when the server configures a prometheus collector (with an
 * optional separate metrics credential); otherwise the server answers 404.
 * `GET /metrics/otel` is a reserved no-op arm with no surface to cover.
 */
export async function metricsPrometheus(options: MetricsPrometheusOptions): PromiseResult<{ body: string }> {
  const op = "metricsPrometheus"
  const parsed = a.safeParse(metricsPrometheusOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const raw = await jmapHttpRequest({
    config: parsed.output.config,
    method: "GET",
    path: "/metrics/prometheus",
    responseType: "text",
  })
  if (!raw.success) return raw
  return createResult({ body: raw.data })
}
