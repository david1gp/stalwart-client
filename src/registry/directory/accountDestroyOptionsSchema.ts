import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const accountDestroyOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  id: a.string(),
  accountId: a.optional(a.string()),
})

export type AccountDestroyOptions = a.InferInput<typeof accountDestroyOptionsSchema>
