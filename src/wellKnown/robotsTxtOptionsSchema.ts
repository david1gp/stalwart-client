import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** Options for `robotsTxt`: fetch the static crawler policy. */
export const robotsTxtOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
})

export type RobotsTxtOptions = a.InferInput<typeof robotsTxtOptionsSchema>
