/**
 * OIDC userinfo claims (`GET /auth/userinfo`).
 *
 * Known claims from `Userinfo` in `crates/common/src/auth/oauth/oidc.rs`;
 * the server currently populates `sub`, `preferred_username`, `email` and
 * `email_verified`. Extra claims stay accessible via the index signature.
 */
export interface OidcUserinfoClaims {
  sub?: string
  name?: string
  preferred_username?: string
  email?: string
  email_verified?: boolean
  [claim: string]: unknown
}
