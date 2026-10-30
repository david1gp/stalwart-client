/**
 * Client info for the login/consent screen (`GET /api/auth/client`).
 *
 * Shape from `ClientInfoResponse` in `crates/http/src/auth/oauth/auth.rs`
 * (Stalwart v1): either the client record (`name`, `logo`, hosts, scope
 * labels, `verified`, `consentRequired`) or an error carrying the OAuth
 * `error`, an optional `description`, and whether the user agent must
 * `redirect` (to `location`) instead of rendering the login form.
 */
export type ManagementClientInfoResponse =
  | {
      name?: string | null
      logo?: string | null
      clientHost?: string | null
      redirectHost?: string | null
      scopes: string[]
      verified: boolean
      consentRequired: boolean
    }
  | {
      error: string
      description?: string
      redirect: boolean
      location?: string
    }
