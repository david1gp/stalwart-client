/**
 * Already-registered credential to exclude from a new passkey ceremony
 * (`PasskeyCredentialDescriptor` in
 * `crates/jmap-proto/src/method/passkey.rs`; `typ` arrives as `type`).
 * Empty when the account has no passkeys yet.
 */
export type PasskeyCredentialDescriptor = {
  type: string
  id: string
}
