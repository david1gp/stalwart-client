import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * `metricsPrometheus` options: only the client config. The endpoint requires
 * whatever auth the server's `Metrics` prometheus section demands
 * (`crates/http/src/request.rs:600-619`); the call sends the configured
 * credentials like any other authenticated request.
 */
export const metricsPrometheusOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
})

export type MetricsPrometheusOptions = a.InferInput<typeof metricsPrometheusOptionsSchema>
