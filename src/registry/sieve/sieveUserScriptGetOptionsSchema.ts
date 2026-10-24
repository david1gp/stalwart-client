import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/** Options for `sieveUserScriptGet`. */
export const sieveUserScriptGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  ids: a.optional(a.array(a.string())),
  properties: a.optional(a.array(a.string())),
  accountId: a.optional(a.string()),
})

export type SieveUserScriptGetOptions = a.InferInput<typeof sieveUserScriptGetOptionsSchema>
