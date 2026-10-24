import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const maskedEmailCreateOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  maskedEmail: a.record(a.string(), a.unknown()),
  accountId: a.optional(a.string()),
})

export type MaskedEmailCreateOptions = a.InferInput<typeof maskedEmailCreateOptionsSchema>
