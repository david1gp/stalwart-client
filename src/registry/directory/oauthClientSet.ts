import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type OauthClientSetOptions, oauthClientSetOptionsSchema } from "./oauthClientSetOptionsSchema.js"

/**
 * `x:OAuthClient/set` — create, update and/or destroy directory OAuthClient entries.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry makes the call a ResultErr.
 */
export async function oauthClientSet(options: OauthClientSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "oauthClientSet"
  const parsed = a.safeParse(oauthClientSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registrySet({ config, objectType: "OAuthClient" as const, ...rest })
}
