import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * Full device flow: authorize → approve with credentials → poll the token
 * endpoint until the grant completes. `pollIntervalMs` defaults to the
 * server's suggested `interval`; `maxAttempts` bounds the polling loop.
 * Pass `consent: true` to pre-approve the scope consent screen (Stalwart v1
 * asks non-first-party clients for consent).
 */
export const oauthDeviceLoginOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  clientId: a.pipe(a.string(), a.minLength(1)),
  accountName: a.pipe(a.string(), a.minLength(1)),
  accountSecret: a.pipe(a.string(), a.minLength(1)),
  scope: a.optional(a.string()),
  nonce: a.optional(a.string()),
  consent: a.optional(a.boolean()),
  pollIntervalMs: a.optional(a.pipe(a.number(), a.integer(), a.minValue(1))),
  maxAttempts: a.optional(a.pipe(a.number(), a.integer(), a.minValue(1))),
})

export type OauthDeviceLoginOptions = a.InferInput<typeof oauthDeviceLoginOptionsSchema>
