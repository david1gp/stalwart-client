/**
 * Login response (`POST /api/auth`).
 *
 * Shape from `LoginResponse` in `crates/http/src/auth/oauth/auth.rs`
 * (Stalwart v1, `tag = "type"`, `rename_all = "camelCase"`): `authenticated`
 * carries the redirect `location`
 * (`{redirect_uri}?code={client_code}&state=…&iss=…`) whose `code` is
 * exchanged at `POST /auth/token`; `consentRequired` returns a `token` for
 * a follow-up `authConsent` login; `verified` confirms a device approval;
 * `mfaRequired` asks for an `mfaToken` retry; `denied`/`invalid` report
 * rejection and bad requests. Passkey ceremonies add `passkeyOptions`
 * (`challenge`/`rpId`/`timeout` for the caller's WebAuthn ceremony),
 * `passkeyUnknown` (no passkey for the account), plus `expired` (stale
 * challenge) and `failure` (rejected assertion) terminal states.
 */
export type ManagementLoginResponse =
  | { type: "authenticated"; location: string }
  | { type: "redirect"; location: string }
  | { type: "invalid"; error: string; description?: string }
  | { type: "verified" }
  | { type: "denied" }
  | { type: "mfaRequired" }
  | { type: "consentRequired"; token: string }
  | { type: "expired" }
  | { type: "failure" }
  | { type: "passkeyOptions"; challenge: string; rpId: string; timeout: number }
  | { type: "passkeyUnknown" }
