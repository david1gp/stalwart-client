/**
 * Accepted public-key credential parameters in a
 * `Passkey/registrationOptions` response (`PasskeyCredentialParameters` in
 * `crates/jmap-proto/src/method/passkey.rs`; `typ` arrives as `type`).
 */
export type PasskeyCredentialParameters = {
  type: string
  alg: number
}
