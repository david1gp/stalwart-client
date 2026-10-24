import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import type { OAuthServerMetadata } from "./OAuthServerMetadata.js"
import { oauthMetadataOptionsSchema, type OauthMetadataOptions } from "./oauthMetadataOptionsSchema.js"

/** Fetch the OAuth authorization server metadata (anonymous, safe). */
export async function oauthMetadata(options: OauthMetadataOptions): PromiseResult<OAuthServerMetadata> {
  const op = "oauthMetadata"
  const parsed = a.safeParse(oauthMetadataOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return jmapHttpRequest<OAuthServerMetadata>({
    config: parsed.output.config,
    method: "GET",
    path: "/.well-known/oauth-authorization-server",
    auth: false,
  })
}
