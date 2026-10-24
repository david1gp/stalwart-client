import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const maskedEmailDestroyOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  id: a.string(),
  accountId: a.optional(a.string()),
})

export type MaskedEmailDestroyOptions = a.InferInput<typeof maskedEmailDestroyOptionsSchema>
