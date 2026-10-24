import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * `POST /api/auth` (anonymous): `authCode` exchanges credentials (+PKCE) for
 * a `client_code`; `authDevice` approves a device `code`. Field sets from
 * `LoginRequest` in `crates/http/src/auth/oauth/auth.rs`.
 */
const managementLoginAuthCodeSchema = a.object({
  type: a.literal("authCode"),
  accountName: a.pipe(a.string(), a.minLength(1)),
  accountSecret: a.pipe(a.string(), a.minLength(1)),
  clientId: a.pipe(a.string(), a.minLength(1)),
  redirectUri: a.optional(a.string()),
  nonce: a.optional(a.string()),
  scope: a.optional(a.string()),
  codeChallenge: a.optional(a.string()),
  codeChallengeMethod: a.optional(a.picklist(["plain", "S256"])),
  state: a.optional(a.string()),
  mfaToken: a.optional(a.string()),
})

const managementLoginAuthDeviceSchema = a.object({
  type: a.literal("authDevice"),
  accountName: a.pipe(a.string(), a.minLength(1)),
  accountSecret: a.pipe(a.string(), a.minLength(1)),
  code: a.pipe(a.string(), a.minLength(1)),
  mfaToken: a.optional(a.string()),
})

export const managementLoginOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  login: a.union([managementLoginAuthCodeSchema, managementLoginAuthDeviceSchema]),
})

export type ManagementLoginOptions = a.InferInput<typeof managementLoginOptionsSchema>
