import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import type { OAuthJwksSet } from "./OAuthJwksSet.js"
import { oauthJwksOptionsSchema, type OauthJwksOptions } from "./oauthJwksOptionsSchema.js"

/** Fetch the OIDC JSON Web Key Set (anonymous, safe). */
export async function oauthJwks(options: OauthJwksOptions): PromiseResult<OAuthJwksSet> {
  const op = "oauthJwks"
  const parsed = a.safeParse(oauthJwksOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return jmapHttpRequest<OAuthJwksSet>({
    config: parsed.output.config,
    method: "GET",
    path: "/auth/jwks.json",
    auth: false,
  })
}
