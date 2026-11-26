/**
 * Authenticator selection criteria in a `Passkey/registrationOptions`
 * response (`PasskeyAuthenticatorSelection` in
 * `crates/jmap-proto/src/method/passkey.rs`, `rename_all = "camelCase"`).
 * Stalwart issues `residentKey: "required"`, `requireResidentKey: true`,
 * `userVerification: "required"`.
 */
export type PasskeyAuthenticatorSelection = {
  residentKey: string
  requireResidentKey: boolean
  userVerification: string
}
