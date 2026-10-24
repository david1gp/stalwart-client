import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * `GET /api/live/delivery/{target}` SSE (authenticated, needs `LiveDeliveryTest`).
 * `token` (from `liveDeliveryToken`) authorizes via `?token=` instead of the
 * header; `timeout` bounds the stream server-side (seconds, min 1).
 * `maxEvents` bounds client-side collection.
 */
export const liveDeliveryOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  target: a.pipe(a.string(), a.minLength(1)),
  timeout: a.optional(a.pipe(a.number(), a.integer(), a.minValue(1))),
  token: a.optional(a.string()),
  maxEvents: a.optional(a.pipe(a.number(), a.integer(), a.minValue(1))),
})

export type LiveDeliveryOptions = a.InferInput<typeof liveDeliveryOptionsSchema>
