import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** Shared options fragment: every op takes `config` first. */
export const stalwartConfigOnlyOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
})
