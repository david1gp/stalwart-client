import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `sieveScriptActivate` arguments. */
export const sieveScriptActivateOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  id: a.string(),
})

export type SieveScriptActivateOptions = a.InferInput<typeof sieveScriptActivateOptionsSchema>
