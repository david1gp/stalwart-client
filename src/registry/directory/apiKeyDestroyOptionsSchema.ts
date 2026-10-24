import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const apiKeyDestroyOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  id: a.string(),
  accountId: a.optional(a.string()),
})

export type ApiKeyDestroyOptions = a.InferInput<typeof apiKeyDestroyOptionsSchema>
