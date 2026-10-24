import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const actionInvalidateNegativeCachesOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
})

export type ActionInvalidateNegativeCachesOptions = a.InferInput<typeof actionInvalidateNegativeCachesOptionsSchema>
