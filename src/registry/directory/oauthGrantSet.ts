import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type OauthGrantSetOptions, oauthGrantSetOptionsSchema } from "./oauthGrantSetOptionsSchema.js"

/**
 * `x:OAuthGrant/set` — create, update and/or destroy OAuthGrant entries.
 * Destroying a grant signs the application out. Grants are normally created
 * by the server during login flows, not by admins.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry makes the call a ResultErr.
 */
export async function oauthGrantSet(options: OauthGrantSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "oauthGrantSet"
  const parsed = a.safeParse(oauthGrantSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registrySet({ config, objectType: "OAuthGrant" as const, ...rest })
}
