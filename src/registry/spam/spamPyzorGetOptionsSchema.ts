import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/** Options for `spamPyzorGet`. */
export const spamPyzorGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  ids: a.optional(a.array(a.string())),
  properties: a.optional(a.array(a.string())),
  accountId: a.optional(a.string()),
})

export type SpamPyzorGetOptions = a.InferInput<typeof spamPyzorGetOptionsSchema>
