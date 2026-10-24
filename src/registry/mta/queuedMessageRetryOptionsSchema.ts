import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/** Options for `queuedMessageRetry`: reschedule a queued message via `nextRetry`. */
export const queuedMessageRetryOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  id: a.string(),
  /** When the next delivery attempt is scheduled; defaults to now (retry immediately). */
  nextRetry: a.optional(a.string()),
})

export type QueuedMessageRetryOptions = a.InferInput<typeof queuedMessageRetryOptionsSchema>
