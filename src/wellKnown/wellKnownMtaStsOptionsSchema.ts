import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** Options for `wellKnownMtaSts`: fetch and parse the MTA-STS policy. */
export const wellKnownMtaStsOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
})

export type WellKnownMtaStsOptions = a.InferInput<typeof wellKnownMtaStsOptionsSchema>
