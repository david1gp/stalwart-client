/**
 * OAuth 2.0 authorization server metadata (`GET /.well-known/oauth-authorization-server`).
 *
 * Field set from `OAuthMetadata` in `crates/http/src/auth/oauth/auth.rs`
 * (grant types `authorization_code`, `refresh_token`,
 * `urn:ietf:params:oauth:grant-type:device_code`; auth methods `none`,
 * `client_secret_post`, `client_secret_basic`; PKCE `S256`). Stalwart v1
 * adds the revocation/end-session endpoints, per-endpoint revocation auth
 * methods, Client ID Metadata Document support and protected resources.
 */
export interface OAuthServerMetadata {
  issuer: string
  token_endpoint: string
  authorization_endpoint: string
  device_authorization_endpoint: string
  registration_endpoint: string
  introspection_endpoint: string
  revocation_endpoint: string
  end_session_endpoint: string
  grant_types_supported: string[]
  response_types_supported: string[]
  scopes_supported: string[]
  token_endpoint_auth_methods_supported: string[]
  revocation_endpoint_auth_methods_supported: string[]
  code_challenge_methods_supported: string[]
  authorization_response_iss_parameter_supported: boolean
  client_id_metadata_document_supported: boolean
  protected_resources: string[]
}
