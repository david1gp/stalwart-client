import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `GET /.well-known/oauth-protected-resource` (anonymous). */
export const oauthProtectedResourceOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
})

export type OauthProtectedResourceOptions = a.InferInput<typeof oauthProtectedResourceOptionsSchema>
