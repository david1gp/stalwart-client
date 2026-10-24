import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/** Options for `mtaTlsStrategyGet` (`x:MtaTlsStrategy/get`). */
export const mtaTlsStrategyGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  ids: a.optional(a.array(a.string())),
  properties: a.optional(a.array(a.string())),
  accountId: a.optional(a.string()),
})

export type MtaTlsStrategyGetOptions = a.InferInput<typeof mtaTlsStrategyGetOptionsSchema>
