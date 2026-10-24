import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `POST /auth/device` with a form body (anonymous, rate-limited). */
export const oauthDeviceAuthorizeOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  clientId: a.pipe(a.string(), a.minLength(1)),
  scope: a.optional(a.string()),
  nonce: a.optional(a.string()),
})

export type OauthDeviceAuthorizeOptions = a.InferInput<typeof oauthDeviceAuthorizeOptionsSchema>
