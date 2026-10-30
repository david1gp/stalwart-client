import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * `GET /auth/logout` (anonymous; Stalwart v1, OpenID RP-Initiated Logout).
 * Query params from `EndSessionParams` in
 * `crates/http/src/auth/oauth/logout.rs`; all optional. The requested
 * `postLogoutRedirectUri` must exactly match a URI registered on the client.
 */
export const oauthLogoutOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  clientId: a.optional(a.string()),
  postLogoutRedirectUri: a.optional(a.string()),
  state: a.optional(a.string()),
  idTokenHint: a.optional(a.string()),
})

export type OauthLogoutOptions = a.InferInput<typeof oauthLogoutOptionsSchema>
