import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `POST /auth/introspect` with a form body (authenticated: admin or self token). */
export const oauthIntrospectOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  token: a.pipe(a.string(), a.minLength(1)),
})

export type OauthIntrospectOptions = a.InferInput<typeof oauthIntrospectOptionsSchema>
