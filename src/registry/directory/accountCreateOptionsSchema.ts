import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const accountCreateOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  account: a.record(a.string(), a.unknown()),
  accountId: a.optional(a.string()),
})

export type AccountCreateOptions = a.InferInput<typeof accountCreateOptionsSchema>
