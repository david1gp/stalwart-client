import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const accountByEmailOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  email: a.string(),
  accountId: a.optional(a.string()),
})

export type AccountByEmailOptions = a.InferInput<typeof accountByEmailOptionsSchema>
