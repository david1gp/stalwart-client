/**
 * A single JSON Web Key from `GET /auth/jwks.json`.
 *
 * The server publishes its OIDC signing keys here; key parameters vary by
 * algorithm, so only the common members are typed and the rest stay open.
 */
export interface OAuthJwk {
  kty?: string
  use?: string
  alg?: string
  kid?: string
  [parameter: string]: unknown
}
