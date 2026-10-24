/**
 * Device authorization response (`POST /auth/device`).
 *
 * Field set from `DeviceAuthResponse` in `crates/http/src/auth/oauth/mod.rs`.
 * The user approves by entering `user_code` (e.g. `BDWP-HQPK`) via
 * `POST /api/auth` (`type: "authDevice"`); the client then polls
 * `POST /auth/token` with `device_code` until the grant completes.
 */
export interface OAuthDeviceAuthorization {
  device_code: string
  user_code: string
  verification_uri: string
  verification_uri_complete: string
  expires_in: number
  interval: number
}
