import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * `POST /auth/register` with a JSON body (RFC 7591).
 * Set `anonymous: true` to register without credentials (only when the server
 * enables `allow_anonymous_client_registration`, otherwise authenticated with
 * the `OAuthClientRegistration` permission).
 */
export const oauthClientRegisterOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  redirectUris: a.pipe(a.array(a.string()), a.minLength(1)),
  clientName: a.optional(a.string()),
  scope: a.optional(a.string()),
  tokenEndpointAuthMethod: a.optional(a.picklist(["client_secret_post", "client_secret_basic", "none"])),
  contacts: a.optional(a.array(a.string())),
  logoUri: a.optional(a.string()),
  anonymous: a.optional(a.boolean()),
})

export type OauthClientRegisterOptions = a.InferInput<typeof oauthClientRegisterOptionsSchema>
