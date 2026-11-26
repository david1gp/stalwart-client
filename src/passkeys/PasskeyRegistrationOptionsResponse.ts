import type { PasskeyCreationOptions } from "./PasskeyCreationOptions.js"

/**
 * `x:Passkey/registrationOptions` response
 * (`PasskeyRegistrationOptionsResponse` in
 * `crates/jmap-proto/src/method/passkey.rs`: `account_id` arrives as
 * `accountId`, `public_key` as `publicKey`).
 */
export type PasskeyRegistrationOptionsResponse = {
  accountId: string
  publicKey: PasskeyCreationOptions
}
