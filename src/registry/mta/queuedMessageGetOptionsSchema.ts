import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/** Options for `queuedMessageGet` (`x:QueuedMessage/get`). */
export const queuedMessageGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  ids: a.optional(a.array(a.string())),
  properties: a.optional(a.array(a.string())),
  accountId: a.optional(a.string()),
})

export type QueuedMessageGetOptions = a.InferInput<typeof queuedMessageGetOptionsSchema>
