import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * `GET /api/live/tracing` SSE (authenticated, enterprise-only).
 * `token` (from `liveTracingToken`) authorizes via `?token=`; `maxEvents`
 * bounds client-side collection since the stream itself never ends.
 */
export const liveTracingOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  token: a.optional(a.string()),
  maxEvents: a.optional(a.pipe(a.number(), a.integer(), a.minValue(1))),
})

export type LiveTracingOptions = a.InferInput<typeof liveTracingOptionsSchema>
