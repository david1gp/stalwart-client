import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const maskedEmailGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  ids: a.optional(a.array(a.string())),
  properties: a.optional(a.array(a.string())),
  accountId: a.optional(a.string()),
})

export type MaskedEmailGetOptions = a.InferInput<typeof maskedEmailGetOptionsSchema>
