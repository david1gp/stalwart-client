import type { PasskeyAuthenticatorSelection } from "./PasskeyAuthenticatorSelection.js"
import type { PasskeyCredentialDescriptor } from "./PasskeyCredentialDescriptor.js"
import type { PasskeyCredentialParameters } from "./PasskeyCredentialParameters.js"
import type { PasskeyRpEntity } from "./PasskeyRpEntity.js"
import type { PasskeyUserEntity } from "./PasskeyUserEntity.js"

/**
 * WebAuthn creation options in a `Passkey/registrationOptions` response
 * (`PasskeyCreationOptions` in `crates/jmap-proto/src/method/passkey.rs`,
 * `rename_all = "camelCase"` so `pub_key_cred_params` arrives as
 * `pubKeyCredParams` and `exclude_credentials` as `excludeCredentials`).
 * Hand these `publicKey` options to the caller's WebAuthn ceremony; this
 * client never invokes a browser ceremony itself.
 */
export type PasskeyCreationOptions = {
  rp: PasskeyRpEntity
  user: PasskeyUserEntity
  challenge: string
  pubKeyCredParams: PasskeyCredentialParameters[]
  timeout: number
  excludeCredentials: PasskeyCredentialDescriptor[]
  authenticatorSelection: PasskeyAuthenticatorSelection
  attestation: string
}
