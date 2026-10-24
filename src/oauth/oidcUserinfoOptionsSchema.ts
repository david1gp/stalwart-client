import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `GET /auth/userinfo` (authenticated: the token's own account). */
export const oidcUserinfoOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
})

export type OidcUserinfoOptions = a.InferInput<typeof oidcUserinfoOptionsSchema>
