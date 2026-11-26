import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * `x:Passkey/registrationOptions` arguments
 * (`PasskeyRegistrationOptionsRequest` in
 * `crates/jmap-proto/src/method/passkey.rs`, mapped in
 * `crates/jmap/src/registry/mapping/passkey.rs`). `accountId` falls back to
 * the session primary account when omitted; `currentSecret` and `otpCode`
 * stay optional on the wire (the server rejects with `forbidden` when the
 * account setup needs one that was not sent), so both validate as non-empty
 * only when present.
 */
export const passkeyRegistrationOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  currentSecret: a.optional(a.pipe(a.string(), a.minLength(1))),
  otpCode: a.optional(a.pipe(a.string(), a.minLength(1))),
})

export type PasskeyRegistrationOptionsOptions = a.InferInput<typeof passkeyRegistrationOptionsSchema>
