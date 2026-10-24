/**
 * Login response (`POST /api/auth`).
 *
 * Shape from `LoginResponse` in `crates/http/src/auth/oauth/auth.rs`:
 * `authenticated` carries the `client_code` to exchange at `POST /auth/token`,
 * `verified` confirms a device approval, `mfaRequired` asks for an `mfaToken`
 * retry and `failure` reports bad credentials.
 */
export type ManagementLoginResponse =
  | { type: "authenticated"; client_code: string; iss: string }
  | { type: "verified" }
  | { type: "mfaRequired" }
  | { type: "failure" }
