import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `GET /.well-known/openid-configuration` (anonymous). */
export const oidcMetadataOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
})

export type OidcMetadataOptions = a.InferInput<typeof oidcMetadataOptionsSchema>
