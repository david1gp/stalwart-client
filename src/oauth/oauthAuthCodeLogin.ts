import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { managementLogin } from "../management/managementLogin.js"
import type { OAuthTokenGranted } from "./OAuthTokenGranted.js"
import { oauthPkcePairCreate } from "./oauthPkcePairCreate.js"
import { oauthToken } from "./oauthToken.js"
import { oauthAuthCodeLoginOptionsSchema, type OauthAuthCodeLoginOptions } from "./oauthAuthCodeLoginOptionsSchema.js"

/**
 * Full authorization-code + PKCE login as tokens.
 *
 * Generates a PKCE pair, posts the credentials + challenge to `POST /api/auth`
 * (`managementLogin`, `LoginRequest::AuthCode` in
 * `crates/http/src/auth/oauth/auth.rs`) to obtain a `client_code`, then
 * exchanges it at `POST /auth/token`. The `redirectUri` must use `https://`
 * (plain `http://` is rejected outside recovery/dev mode) and match the
 * client's registration.
 */
export async function oauthAuthCodeLogin(options: OauthAuthCodeLoginOptions): PromiseResult<OAuthTokenGranted> {
  const op = "oauthAuthCodeLogin"
  const parsed = a.safeParse(oauthAuthCodeLoginOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountName, accountSecret, clientId, redirectUri, scope, nonce, mfaToken } = parsed.output
  const pair = await oauthPkcePairCreate()
  if (!pair.success) return pair
  const login = await managementLogin({
    config,
    login: {
      type: "authCode",
      accountName,
      accountSecret,
      clientId,
      redirectUri,
      codeChallenge: pair.data.challenge,
      codeChallengeMethod: "S256",
      ...(scope !== undefined ? { scope } : {}),
      ...(nonce !== undefined ? { nonce } : {}),
      ...(mfaToken !== undefined ? { mfaToken } : {}),
    },
  })
  if (!login.success) return login
  if (login.data.type !== "authenticated") {
    return createResultError(
      op,
      `Login did not issue an authorization code (response type: ${login.data.type})`,
      JSON.stringify(login.data),
    )
  }
  return oauthToken({
    config,
    grantType: "authorization_code",
    code: login.data.client_code,
    clientId,
    redirectUri,
    codeVerifier: pair.data.verifier,
  })
}
