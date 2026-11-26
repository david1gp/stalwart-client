import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * WebAuthn assertion for the passkey login variants (`PasskeyAssertion` in
 * `crates/common/src/auth/passkey/assertion.rs`, `rename_all = "camelCase"`
 * with explicit `clientDataJSON` / `authenticatorData` renames). Carries the
 * caller's ceremony output; this client never performs that ceremony itself.
 */
const managementLoginPasskeyAssertionSchema = a.object({
  rawId: a.pipe(a.string(), a.minLength(1)),
  response: a.object({
    clientDataJSON: a.pipe(a.string(), a.minLength(1)),
    authenticatorData: a.pipe(a.string(), a.minLength(1)),
    signature: a.pipe(a.string(), a.minLength(1)),
    userHandle: a.optional(a.string()),
  }),
})

/**
 * `POST /api/auth` (anonymous). Field sets from `LoginRequest` in
 * `crates/http/src/auth/oauth/auth.rs` (Stalwart v1):
 * - `authCode` posts credentials plus the raw authorization `query`
 *   (`response_type=code&client_id=…&redirect_uri=…&state=…&scope=…&nonce=…&
 *   code_challenge=…&code_challenge_method=S256`); the server answers
 *   `authenticated` with a redirect `location` carrying `?code=&state=&iss=`.
 * - `authDevice` approves a device `code` (the user-facing `user_code`).
 * - `authConsent` confirms a pending consent `token` for the same `query`.
 * - `passkeyOptions` asks for a sign-in challenge (`passkeyOptions` answer).
 * - `authCodePasskey` / `authDevicePasskey` answer that challenge with the
 *   caller's WebAuthn `credential` assertion for the same `query` / `code`.
 */
const managementLoginAuthCodeSchema = a.object({
  type: a.literal("authCode"),
  accountName: a.pipe(a.string(), a.minLength(1)),
  accountSecret: a.pipe(a.string(), a.minLength(1)),
  query: a.pipe(a.string(), a.minLength(1)),
  consent: a.optional(a.boolean()),
  mfaToken: a.optional(a.string()),
})

const managementLoginAuthDeviceSchema = a.object({
  type: a.literal("authDevice"),
  accountName: a.pipe(a.string(), a.minLength(1)),
  accountSecret: a.pipe(a.string(), a.minLength(1)),
  code: a.pipe(a.string(), a.minLength(1)),
  consent: a.optional(a.boolean()),
  mfaToken: a.optional(a.string()),
})

const managementLoginAuthConsentSchema = a.object({
  type: a.literal("authConsent"),
  token: a.pipe(a.string(), a.minLength(1)),
  query: a.pipe(a.string(), a.minLength(1)),
  consent: a.boolean(),
})

const managementLoginPasskeyOptionsSchema = a.object({
  type: a.literal("passkeyOptions"),
})

const managementLoginAuthCodePasskeySchema = a.object({
  type: a.literal("authCodePasskey"),
  credential: managementLoginPasskeyAssertionSchema,
  query: a.pipe(a.string(), a.minLength(1)),
  consent: a.optional(a.boolean()),
})

const managementLoginAuthDevicePasskeySchema = a.object({
  type: a.literal("authDevicePasskey"),
  credential: managementLoginPasskeyAssertionSchema,
  code: a.pipe(a.string(), a.minLength(1)),
  consent: a.optional(a.boolean()),
})

export const managementLoginOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  login: a.union([
    managementLoginAuthCodeSchema,
    managementLoginAuthDeviceSchema,
    managementLoginAuthConsentSchema,
    managementLoginPasskeyOptionsSchema,
    managementLoginAuthCodePasskeySchema,
    managementLoginAuthDevicePasskeySchema,
  ]),
})

export type ManagementLoginOptions = a.InferInput<typeof managementLoginOptionsSchema>
