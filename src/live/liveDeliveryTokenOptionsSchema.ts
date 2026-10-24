import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `GET /api/token/delivery` (authenticated, needs `LiveDeliveryTest`). */
export const liveDeliveryTokenOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
})

export type LiveDeliveryTokenOptions = a.InferInput<typeof liveDeliveryTokenOptionsSchema>
