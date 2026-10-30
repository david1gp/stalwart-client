import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * Full authorization-code + PKCE login: build the authorization `query`,
 * `POST /api/auth` with credentials, then `POST /auth/token` with the code
 * parsed from the redirect `location`. `state` defaults to a random value;
 * pass `consent: true` to pre-approve the scope consent screen.
 */
export const oauthAuthCodeLoginOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountName: a.pipe(a.string(), a.minLength(1)),
  accountSecret: a.pipe(a.string(), a.minLength(1)),
  clientId: a.pipe(a.string(), a.minLength(1)),
  redirectUri: a.pipe(a.string(), a.minLength(1)),
  scope: a.optional(a.string()),
  nonce: a.optional(a.string()),
  state: a.optional(a.string()),
  consent: a.optional(a.boolean()),
  mfaToken: a.optional(a.string()),
})

export type OauthAuthCodeLoginOptions = a.InferInput<typeof oauthAuthCodeLoginOptionsSchema>
