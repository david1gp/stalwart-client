import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/** Options for `sieveUserInterpreterGet`. */
export const sieveUserInterpreterGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  ids: a.optional(a.array(a.string())),
  properties: a.optional(a.array(a.string())),
  accountId: a.optional(a.string()),
})

export type SieveUserInterpreterGetOptions = a.InferInput<typeof sieveUserInterpreterGetOptionsSchema>
