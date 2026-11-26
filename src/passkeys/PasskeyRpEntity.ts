/**
 * Relying-party entity in a `Passkey/registrationOptions` response
 * (`PasskeyRpEntity` in `crates/jmap-proto/src/method/passkey.rs`).
 */
export type PasskeyRpEntity = {
  id: string
  name: string
}
