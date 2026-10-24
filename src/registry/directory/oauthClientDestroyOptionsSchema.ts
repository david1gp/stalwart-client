import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const oauthClientDestroyOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  id: a.string(),
  accountId: a.optional(a.string()),
})

export type OauthClientDestroyOptions = a.InferInput<typeof oauthClientDestroyOptionsSchema>
