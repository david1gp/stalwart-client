/**
 * User entity in a `Passkey/registrationOptions` response
 * (`PasskeyUserEntity` in `crates/jmap-proto/src/method/passkey.rs`,
 * `rename_all = "camelCase"` so `display_name` arrives as `displayName`).
 */
export type PasskeyUserEntity = {
  id: string
  name: string
  displayName: string
}
