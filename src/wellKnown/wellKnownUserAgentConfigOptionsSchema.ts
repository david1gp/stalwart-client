import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** Options for `wellKnownUserAgentConfig`: fetch the PACC document. */
export const wellKnownUserAgentConfigOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
})

export type WellKnownUserAgentConfigOptions = a.InferInput<typeof wellKnownUserAgentConfigOptionsSchema>
