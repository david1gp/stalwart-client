import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import type { OAuthResourceMetadata } from "./OAuthResourceMetadata.js"
import {
  oauthProtectedResourceOptionsSchema,
  type OauthProtectedResourceOptions,
} from "./oauthProtectedResourceOptionsSchema.js"

/** Fetch the OAuth protected resource metadata (anonymous, safe). */
export async function oauthProtectedResource(
  options: OauthProtectedResourceOptions,
): PromiseResult<OAuthResourceMetadata> {
  const op = "oauthProtectedResource"
  const parsed = a.safeParse(oauthProtectedResourceOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return jmapHttpRequest<OAuthResourceMetadata>({
    config: parsed.output.config,
    method: "GET",
    path: "/.well-known/oauth-protected-resource",
    auth: false,
  })
}
