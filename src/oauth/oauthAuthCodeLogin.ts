import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { managementLogin } from "../management/managementLogin.js"
import type { OAuthTokenGranted } from "./OAuthTokenGranted.js"
import { oauthPkcePairCreate } from "./oauthPkcePairCreate.js"
import { oauthToken } from "./oauthToken.js"
import { oauthAuthCodeLoginOptionsSchema, type OauthAuthCodeLoginOptions } from "./oauthAuthCodeLoginOptionsSchema.js"

/**
 * Full authorization-code + PKCE login as tokens (Stalwart v1).
 *
 * Generates a PKCE pair, posts the credentials plus the authorization
 * `query` to `POST /api/auth` (`LoginRequest::AuthCode` in
 * `crates/http/src/auth/oauth/auth.rs`), parses the `code` out of the
 * `authenticated` redirect `location`, then exchanges it at
 * `POST /auth/token`. The `redirectUri` must use `https://` (plain `http://`
 * is rejected outside recovery/dev mode) and match the client's
 * registration. A `consentRequired` login answer is a ResultErr: re-run with
 * `consent: true` or complete the `authConsent` login via `managementLogin`.
 */
export async function oauthAuthCodeLogin(options: OauthAuthCodeLoginOptions): PromiseResult<OAuthTokenGranted> {
  const op = "oauthAuthCodeLogin"
  const parsed = a.safeParse(oauthAuthCodeLoginOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountName, accountSecret, clientId, redirectUri, scope, nonce, consent, mfaToken } = parsed.output
  const pair = await oauthPkcePairCreate()
  if (!pair.success) return pair
  const state = parsed.output.state ?? randomState()
  const query = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    code_challenge: pair.data.challenge,
    code_challenge_method: "S256",
    ...(scope !== undefined ? { scope } : {}),
    ...(nonce !== undefined ? { nonce } : {}),
  }).toString()
  const login = await managementLogin({
    config,
    login: {
      type: "authCode",
      accountName,
      accountSecret,
      query,
      ...(consent !== undefined ? { consent } : {}),
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
  let code: string | null
  try {
    code = new URL(login.data.location).searchParams.get("code")
  } catch {
    code = null
  }
  if (code === null || code === "") {
    return createResultError(op, "Login redirect carried no code parameter", JSON.stringify(login.data))
  }
  return oauthToken({
    config,
    grantType: "authorization_code",
    code,
    clientId,
    redirectUri,
    codeVerifier: pair.data.verifier,
  })
}

function randomState(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Buffer.from(bytes).toString("base64url")
}
