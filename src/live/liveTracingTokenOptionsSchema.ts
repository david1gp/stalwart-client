import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `GET /api/token/tracing` (authenticated, enterprise-only). */
export const liveTracingTokenOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
})

export type LiveTracingTokenOptions = a.InferInput<typeof liveTracingTokenOptionsSchema>
