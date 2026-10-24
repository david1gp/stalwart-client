import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/** Options for `mtaMilterGet` (`x:MtaMilter/get`). */
export const mtaMilterGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  ids: a.optional(a.array(a.string())),
  properties: a.optional(a.array(a.string())),
  accountId: a.optional(a.string()),
})

export type MtaMilterGetOptions = a.InferInput<typeof mtaMilterGetOptionsSchema>
