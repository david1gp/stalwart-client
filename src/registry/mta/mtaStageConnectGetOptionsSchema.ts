import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/** Options for `mtaStageConnectGet` (`x:MtaStageConnect/get`). */
export const mtaStageConnectGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  ids: a.optional(a.array(a.string())),
  properties: a.optional(a.array(a.string())),
  accountId: a.optional(a.string()),
})

export type MtaStageConnectGetOptions = a.InferInput<typeof mtaStageConnectGetOptionsSchema>
