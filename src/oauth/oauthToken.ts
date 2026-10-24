import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import type { OAuthTokenGranted } from "./OAuthTokenGranted.js"
import { oauthTokenOptionsSchema, type OauthTokenOptions } from "./oauthTokenOptionsSchema.js"

/**
 * Exchange a grant for tokens (`POST /auth/token`, anonymous).
 *
 * Covers `authorization_code` (+PKCE `S256` `code_verifier`), the device-code
 * grant and `refresh_token` (`handle_token_request` in
 * `crates/http/src/auth/oauth/token.rs`). Error grants (HTTP 400
 * `{error: "authorization_pending" | …}`) surface as a `ResultErr` whose
 * `errorData` holds the server JSON.
 */
export async function oauthToken(options: OauthTokenOptions): PromiseResult<OAuthTokenGranted> {
  const op = "oauthToken"
  const parsed = a.safeParse(oauthTokenOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, grantType, code, deviceCode, refreshToken, clientId, clientSecret, redirectUri, codeVerifier } =
    parsed.output
  const clientAuth = parsed.output.clientAuth ?? "none"
  const fields: Record<string, string> = { grant_type: grantType }
  if (grantType === "authorization_code") {
    if (code !== undefined) fields.code = code
    if (redirectUri !== undefined) fields.redirect_uri = redirectUri
    if (codeVerifier !== undefined) fields.code_verifier = codeVerifier
  }
  if (grantType === "urn:ietf:params:oauth:grant-type:device_code" && deviceCode !== undefined) {
    fields.device_code = deviceCode
  }
  if (grantType === "refresh_token" && refreshToken !== undefined) fields.refresh_token = refreshToken
  if (clientId !== undefined && clientAuth !== "client_secret_basic") fields.client_id = clientId
  if (clientSecret !== undefined && clientAuth === "client_secret_post") fields.client_secret = clientSecret
  return jmapHttpRequest<OAuthTokenGranted>({
    config,
    method: "POST",
    path: "/auth/token",
    auth: false,
    ...(clientAuth === "client_secret_basic" && clientId !== undefined
      ? {
          headers: {
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret ?? ""}`).toString("base64")}`,
          },
        }
      : {}),
    body: { kind: "form", value: fields },
  })
}
