import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * `POST /auth/token` with a form body (anonymous; client authentication via
 * `clientAuth`: `none` sends just `client_id`, `client_secret_post` adds
 * `client_secret` to the form, `client_secret_basic` sends both as an HTTP
 * Basic credential — `client_credentials` in `crates/http/src/auth/oauth/token.rs`).
 */
export const oauthTokenOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  grantType: a.picklist(["authorization_code", "urn:ietf:params:oauth:grant-type:device_code", "refresh_token"]),
  code: a.optional(a.string()),
  deviceCode: a.optional(a.string()),
  refreshToken: a.optional(a.string()),
  clientId: a.optional(a.string()),
  clientSecret: a.optional(a.string()),
  redirectUri: a.optional(a.string()),
  codeVerifier: a.optional(a.string()),
  scope: a.optional(a.string()),
  clientAuth: a.optional(a.picklist(["none", "client_secret_post", "client_secret_basic"])),
})

export type OauthTokenOptions = a.InferInput<typeof oauthTokenOptionsSchema>
