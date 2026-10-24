import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `webSocketConnect` options: only the client config (auth + baseUrl + timeout). */
export const webSocketConnectOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
})

export type WebSocketConnectOptions = a.InferInput<typeof webSocketConnectOptionsSchema>
