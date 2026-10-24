/**
 * Token introspection result (`POST /auth/introspect`).
 *
 * Field set from `OAuthIntrospect` in
 * `crates/common/src/auth/oauth/introspect.rs`. Inactive or unknown tokens
 * return `{active: false}` with no further fields.
 */
export interface OAuthIntrospection {
  active: boolean
  scope?: string
  client_id?: string
  username?: string
  token_type?: string
  exp?: number
  iat?: number
  nbf?: number
  sub?: string
}
