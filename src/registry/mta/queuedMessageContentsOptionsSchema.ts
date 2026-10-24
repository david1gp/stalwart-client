import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/** Options for `queuedMessageContents`: fetch a queued message and download its raw bytes. */
export const queuedMessageContentsOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  id: a.string(),
  accountId: a.optional(a.string()),
})

export type QueuedMessageContentsOptions = a.InferInput<typeof queuedMessageContentsOptionsSchema>
