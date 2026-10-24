import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const actionResumeMtaQueueOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
})

export type ActionResumeMtaQueueOptions = a.InferInput<typeof actionResumeMtaQueueOptionsSchema>
