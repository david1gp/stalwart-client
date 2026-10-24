import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `GET /api/token/metrics` (authenticated, enterprise-only). */
export const liveMetricsTokenOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
})

export type LiveMetricsTokenOptions = a.InferInput<typeof liveMetricsTokenOptionsSchema>
