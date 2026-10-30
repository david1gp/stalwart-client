import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryOAuthGrant } from "../generated/RegistryOAuthGrant.js"
import { registryGet } from "../registryGet.js"
import { type OauthGrantGetOptions, oauthGrantGetOptionsSchema } from "./oauthGrantGetOptionsSchema.js"

/**
 * `x:OAuthGrant/get` — fetch the authorizations accounts granted to OAuth
 * applications ("Connected Applications"). Destroying a grant signs that
 * application out (see `oauthGrantDestroy`).
 */
export async function oauthGrantGet(
  options: OauthGrantGetOptions,
): PromiseResult<JmapGetResponse<RegistryOAuthGrant & { id: string }>> {
  const op = "oauthGrantGet"
  const parsed = a.safeParse(oauthGrantGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registryGet({ config, objectType: "OAuthGrant" as const, ...rest })
}
