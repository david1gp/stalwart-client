import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * `GET /api/live/metrics` SSE (authenticated, enterprise-only).
 * `token` (from `liveMetricsToken`) authorizes via `?token=`; `maxEvents`
 * bounds client-side collection since the stream itself never ends.
 */
export const liveMetricsOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  token: a.optional(a.string()),
  maxEvents: a.optional(a.pipe(a.number(), a.integer(), a.minValue(1))),
})

export type LiveMetricsOptions = a.InferInput<typeof liveMetricsOptionsSchema>
