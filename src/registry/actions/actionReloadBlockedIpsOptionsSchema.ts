import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const actionReloadBlockedIpsOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
})

export type ActionReloadBlockedIpsOptions = a.InferInput<typeof actionReloadBlockedIpsOptionsSchema>
