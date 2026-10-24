import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/** Options for `mtaStageDataGet` (`x:MtaStageData/get`). */
export const mtaStageDataGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  ids: a.optional(a.array(a.string())),
  properties: a.optional(a.array(a.string())),
  accountId: a.optional(a.string()),
})

export type MtaStageDataGetOptions = a.InferInput<typeof mtaStageDataGetOptionsSchema>
