/**
 * Granted OAuth tokens (`POST /auth/token`, HTTP 200).
 *
 * Field set from `OAuthResponse` in `crates/http/src/auth/oauth/mod.rs`.
 * Error grants come back as HTTP 400 `{error}` and surface as a `ResultErr`.
 */
export interface OAuthTokenGranted {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  scope?: string
  id_token?: string
}
