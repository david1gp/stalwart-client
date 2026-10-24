import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/** Options for `mtaStageRcptGet` (`x:MtaStageRcpt/get`). */
export const mtaStageRcptGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  ids: a.optional(a.array(a.string())),
  properties: a.optional(a.array(a.string())),
  accountId: a.optional(a.string()),
})

export type MtaStageRcptGetOptions = a.InferInput<typeof mtaStageRcptGetOptionsSchema>
