import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * Full authorization-code + PKCE login: `POST /api/auth` with credentials and
 * a fresh PKCE challenge, then `POST /auth/token` with the verifier.
 */
export const oauthAuthCodeLoginOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountName: a.pipe(a.string(), a.minLength(1)),
  accountSecret: a.pipe(a.string(), a.minLength(1)),
  clientId: a.pipe(a.string(), a.minLength(1)),
  redirectUri: a.pipe(a.string(), a.minLength(1)),
  scope: a.optional(a.string()),
  nonce: a.optional(a.string()),
  mfaToken: a.optional(a.string()),
})

export type OauthAuthCodeLoginOptions = a.InferInput<typeof oauthAuthCodeLoginOptionsSchema>
