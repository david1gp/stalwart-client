import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import type { OAuthClientRegistration } from "./OAuthClientRegistration.js"
import {
  oauthClientRegisterOptionsSchema,
  type OauthClientRegisterOptions,
} from "./oauthClientRegisterOptionsSchema.js"

/**
 * Register an OAuth client dynamically (`POST /auth/register`, RFC 7591).
 *
 * Public clients (auth method omitted/`none`) get a stateless self-describing
 * `client_id`; confidential clients are persisted as `x:OAuthClient` and get a
 * `client_secret` back (`handle_oauth_registration_request` in
 * `crates/http/src/auth/oauth/registration.rs`).
 */
export async function oauthClientRegister(options: OauthClientRegisterOptions): PromiseResult<OAuthClientRegistration> {
  const op = "oauthClientRegister"
  const parsed = a.safeParse(oauthClientRegisterOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, redirectUris, clientName, scope, tokenEndpointAuthMethod, contacts, logoUri, anonymous } =
    parsed.output
  return jmapHttpRequest<OAuthClientRegistration>({
    config,
    method: "POST",
    path: "/auth/register",
    ...(anonymous === true ? { auth: false as const } : {}),
    body: {
      kind: "json",
      value: {
        redirect_uris: redirectUris,
        ...(clientName !== undefined ? { client_name: clientName } : {}),
        ...(scope !== undefined ? { scope } : {}),
        ...(tokenEndpointAuthMethod !== undefined ? { token_endpoint_auth_method: tokenEndpointAuthMethod } : {}),
        ...(contacts !== undefined ? { contacts } : {}),
        ...(logoUri !== undefined ? { logo_uri: logoUri } : {}),
      },
    },
  })
}
