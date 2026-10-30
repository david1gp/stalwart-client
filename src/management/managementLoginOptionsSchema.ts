import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * `POST /api/auth` (anonymous). Field sets from `LoginRequest` in
 * `crates/http/src/auth/oauth/auth.rs` (Stalwart v1):
 * - `authCode` posts credentials plus the raw authorization `query`
 *   (`response_type=code&client_id=…&redirect_uri=…&state=…&scope=…&nonce=…&
 *   code_challenge=…&code_challenge_method=S256`); the server answers
 *   `authenticated` with a redirect `location` carrying `?code=&state=&iss=`.
 * - `authDevice` approves a device `code` (the user-facing `user_code`).
 * - `authConsent` confirms a pending consent `token` for the same `query`.
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

export const managementLoginOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  login: a.union([managementLoginAuthCodeSchema, managementLoginAuthDeviceSchema, managementLoginAuthConsentSchema]),
})

export type ManagementLoginOptions = a.InferInput<typeof managementLoginOptionsSchema>
