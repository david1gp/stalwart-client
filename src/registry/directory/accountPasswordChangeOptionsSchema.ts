import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const accountPasswordChangeOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  currentSecret: a.string(),
  newSecret: a.string(),
  accountId: a.optional(a.string()),
})

export type AccountPasswordChangeOptions = a.InferInput<typeof accountPasswordChangeOptionsSchema>
