import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `healthReady` options: only the client config (the endpoint is anonymous). */
export const healthReadyOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
})

export type HealthReadyOptions = a.InferInput<typeof healthReadyOptionsSchema>
