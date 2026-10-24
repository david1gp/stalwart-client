import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/** Options for `mtaConnectionStrategyGet` (`x:MtaConnectionStrategy/get`). */
export const mtaConnectionStrategyGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  ids: a.optional(a.array(a.string())),
  properties: a.optional(a.array(a.string())),
  accountId: a.optional(a.string()),
})

export type MtaConnectionStrategyGetOptions = a.InferInput<typeof mtaConnectionStrategyGetOptionsSchema>
