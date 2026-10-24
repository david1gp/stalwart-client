import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `SieveScript/get` arguments. */
export const sieveScriptGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  ids: a.optional(a.array(a.string())),
  properties: a.optional(a.array(a.string())),
})

export type SieveScriptGetOptions = a.InferInput<typeof sieveScriptGetOptionsSchema>
