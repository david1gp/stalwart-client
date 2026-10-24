import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const oauthClientUpdateOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  id: a.string(),
  patch: a.record(a.string(), a.unknown()),
  accountId: a.optional(a.string()),
})

export type OauthClientUpdateOptions = a.InferInput<typeof oauthClientUpdateOptionsSchema>
