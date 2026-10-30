import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type OauthGrantDestroyOptions, oauthGrantDestroyOptionsSchema } from "./oauthGrantDestroyOptionsSchema.js"

/**
 * `x:OAuthGrant/set` destroy — revoke one OAuth authorization by id.
 * Revoking signs the application out of the account.
 */
export async function oauthGrantDestroy(
  options: OauthGrantDestroyOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "oauthGrantDestroy"
  const parsed = a.safeParse(oauthGrantDestroyOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({
    config: parsed.output.config,
    objectType: "OAuthGrant" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    destroy: [parsed.output.id],
  })
}
