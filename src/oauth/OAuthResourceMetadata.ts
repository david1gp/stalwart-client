/**
 * OAuth 2.0 protected resource metadata (`GET /.well-known/oauth-protected-resource`).
 *
 * Field set from `ProtectedResourceMetadata` in `crates/http/src/auth/oauth/auth.rs`.
 */
export interface OAuthResourceMetadata {
  resource: string
  authorization_servers: string[]
  scopes_supported: string[]
  bearer_methods_supported: string[]
}
