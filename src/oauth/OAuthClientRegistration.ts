/**
 * OAuth dynamic client registration response (`POST /auth/register`, HTTP 201).
 *
 * Field set from `ClientRegistrationResponse` in
 * `crates/common/src/auth/oauth/registration.rs`: the issued identifiers plus
 * an echo of the registration request.
 */
export interface OAuthClientRegistration {
  client_id: string
  client_secret?: string
  registration_access_token?: string
  registration_client_uri?: string
  client_id_issued_at?: number
  client_secret_expires_at?: number
  [field: string]: unknown
}
