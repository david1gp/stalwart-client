/**
 * OpenID Connect discovery document (`GET /.well-known/openid-configuration`,
 * also returned by `GET /api/discover/{email}` for local domains).
 *
 * Field set from `OpenIdMetadata` in `crates/http/src/auth/oauth/openid.rs`.
 */
export interface OidcDiscoveryDocument {
  issuer: string
  authorization_endpoint: string
  token_endpoint: string
  userinfo_endpoint: string
  jwks_uri: string
  registration_endpoint: string
  device_authorization_endpoint: string
  revocation_endpoint: string
  end_session_endpoint: string
  scopes_supported: string[]
  response_types_supported: string[]
  subject_types_supported: string[]
  grant_types_supported: string[]
  token_endpoint_auth_methods_supported: string[]
  revocation_endpoint_auth_methods_supported: string[]
  id_token_signing_alg_values_supported: string[]
  claims_supported: string[]
  code_challenge_methods_supported: string[]
  authorization_response_iss_parameter_supported: boolean
  client_id_metadata_document_supported: boolean
  protected_resources: string[]
  stalwart_required_scopes?: string[]
}
