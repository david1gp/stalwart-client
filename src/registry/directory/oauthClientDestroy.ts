import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type OauthClientDestroyOptions, oauthClientDestroyOptionsSchema } from "./oauthClientDestroyOptionsSchema.js"

/**
 * `x:OAuthClient/set` destroy — destroy one directory OAuthClient entry by id.
 */
export async function oauthClientDestroy(
  options: OauthClientDestroyOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "oauthClientDestroy"
  const parsed = a.safeParse(oauthClientDestroyOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({
    config: parsed.output.config,
    objectType: "OAuthClient" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    destroy: [parsed.output.id],
  })
}
