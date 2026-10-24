import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `GET /.well-known/oauth-authorization-server` (anonymous). */
export const oauthMetadataOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
})

export type OauthMetadataOptions = a.InferInput<typeof oauthMetadataOptionsSchema>
