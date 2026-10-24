import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/** Options for `mtaStageEhloGet` (`x:MtaStageEhlo/get`). */
export const mtaStageEhloGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  ids: a.optional(a.array(a.string())),
  properties: a.optional(a.array(a.string())),
  accountId: a.optional(a.string()),
})

export type MtaStageEhloGetOptions = a.InferInput<typeof mtaStageEhloGetOptionsSchema>
