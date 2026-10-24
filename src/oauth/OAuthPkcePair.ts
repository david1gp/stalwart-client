/**
 * PKCE pair (RFC 7636) for the OAuth authorization-code flow.
 *
 * `verifier` uses 43–128 characters from the server-accepted alphabet
 * (`verify_pkce` in `crates/http/src/auth/oauth/token.rs`); `challenge` is
 * `BASE64URL(SHA-256(verifier))` with the `S256` method.
 */
export interface OAuthPkcePair {
  verifier: string
  challenge: string
  method: "S256"
}
