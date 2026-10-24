/**
 * OAuth token error body (`POST /auth/token`, HTTP 400).
 *
 * Variants from `ErrorType` in `crates/http/src/auth/oauth/mod.rs`
 * (`invalid_grant`, `invalid_client`, `authorization_pending`, `slow_down`, …).
 * The client surfaces these as a `ResultErr` whose `errorData` holds this JSON.
 */
export interface OAuthTokenError {
  error: string
}
