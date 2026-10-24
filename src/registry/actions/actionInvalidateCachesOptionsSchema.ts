import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const actionInvalidateCachesOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
})

export type ActionInvalidateCachesOptions = a.InferInput<typeof actionInvalidateCachesOptionsSchema>
