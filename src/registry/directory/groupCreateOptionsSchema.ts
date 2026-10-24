import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const groupCreateOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  name: a.string(),
  domainId: a.string(),
  description: a.optional(a.string()),
  accountId: a.optional(a.string()),
})

export type GroupCreateOptions = a.InferInput<typeof groupCreateOptionsSchema>
