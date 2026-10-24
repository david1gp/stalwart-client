import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `healthLive` options: only the client config (the endpoint is anonymous). */
export const healthLiveOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
})

export type HealthLiveOptions = a.InferInput<typeof healthLiveOptionsSchema>
