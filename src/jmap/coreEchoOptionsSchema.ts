import * as a from "valibot"
import { jmapClientConfigSchema } from "./jmapClientConfigSchema.js"

/** `Core/echo` arguments — the server returns them verbatim. */
export const coreEchoOptionsSchema = a.object({
  config: jmapClientConfigSchema,
  args: a.optional(a.record(a.string(), a.unknown())),
})

export type CoreEchoOptions = a.InferInput<typeof coreEchoOptionsSchema>
