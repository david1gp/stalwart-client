import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/** Options for `queuedMessageCancel`: remove a queued message via `/set` destroy. */
export const queuedMessageCancelOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  id: a.string(),
})

export type QueuedMessageCancelOptions = a.InferInput<typeof queuedMessageCancelOptionsSchema>
