import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const oauthClientCreateOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  oauthClient: a.record(a.string(), a.unknown()),
  accountId: a.optional(a.string()),
})

export type OauthClientCreateOptions = a.InferInput<typeof oauthClientCreateOptionsSchema>
