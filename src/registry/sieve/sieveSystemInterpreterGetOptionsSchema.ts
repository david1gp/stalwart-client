import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/** Options for `sieveSystemInterpreterGet`. */
export const sieveSystemInterpreterGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  ids: a.optional(a.array(a.string())),
  properties: a.optional(a.array(a.string())),
  accountId: a.optional(a.string()),
})

export type SieveSystemInterpreterGetOptions = a.InferInput<typeof sieveSystemInterpreterGetOptionsSchema>
