import type { OAuthJwk } from "./OAuthJwk.js"

/** JSON Web Key Set (`GET /auth/jwks.json`). */
export interface OAuthJwksSet {
  keys: OAuthJwk[]
}
