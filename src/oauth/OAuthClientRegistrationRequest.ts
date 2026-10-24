/**
 * OAuth dynamic client registration request (`POST /auth/register`, RFC 7591).
 *
 * Field set from `ClientRegistrationRequest` in
 * `crates/common/src/auth/oauth/registration.rs`. At least one
 * `redirect_uris` entry is required. Public clients (`token_endpoint_auth_method`
 * omitted or `"none"`) receive a stateless self-describing `client_id` with no
 * database write; confidential clients additionally need an authenticated
 * caller with the `OAuthClientRegistration` permission and get back a
 * `client_secret`.
 */
export interface OAuthClientRegistrationRequest {
  redirect_uris: string[]
  scope?: string
  response_types?: string[]
  grant_types?: string[]
  client_name?: string
  contacts?: string[]
  logo_uri?: string
  token_endpoint_auth_method?: "client_secret_post" | "client_secret_basic" | "none"
  [field: string]: unknown
}
