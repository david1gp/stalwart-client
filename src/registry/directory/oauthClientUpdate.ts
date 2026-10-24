import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type OauthClientUpdateOptions, oauthClientUpdateOptionsSchema } from "./oauthClientUpdateOptionsSchema.js"

/**
 * `x:OAuthClient/set` update — update one directory OAuthClient entry by id.
 */
export async function oauthClientUpdate(
  options: OauthClientUpdateOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "oauthClientUpdate"
  const parsed = a.safeParse(oauthClientUpdateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({
    config: parsed.output.config,
    objectType: "OAuthClient" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    update: { [parsed.output.id]: parsed.output.patch },
  })
}
