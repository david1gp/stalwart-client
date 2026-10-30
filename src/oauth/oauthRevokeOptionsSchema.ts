import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * `POST /auth/revoke` with a form body (RFC 7009, anonymous; Stalwart v1).
 * Client authentication mirrors `POST /auth/token`: `none` sends just
 * `client_id`, `client_secret_post` adds `client_secret` to the form,
 * `client_secret_basic` sends both as an HTTP Basic credential.
 */
export const oauthRevokeOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  token: a.pipe(a.string(), a.minLength(1)),
  clientId: a.optional(a.string()),
  clientSecret: a.optional(a.string()),
  clientAuth: a.optional(a.picklist(["none", "client_secret_post", "client_secret_basic"])),
})

export type OauthRevokeOptions = a.InferInput<typeof oauthRevokeOptionsSchema>
