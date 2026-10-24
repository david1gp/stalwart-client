import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const actionPauseMtaQueueOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
})

export type ActionPauseMtaQueueOptions = a.InferInput<typeof actionPauseMtaQueueOptionsSchema>
