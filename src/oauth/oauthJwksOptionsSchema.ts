import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `GET /auth/jwks.json` (anonymous). */
export const oauthJwksOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
})

export type OauthJwksOptions = a.InferInput<typeof oauthJwksOptionsSchema>
