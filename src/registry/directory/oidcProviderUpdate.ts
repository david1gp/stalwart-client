import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import { REGISTRY_SINGLETON_ID } from "../REGISTRY_SINGLETON_ID.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type OidcProviderUpdateOptions, oidcProviderUpdateOptionsSchema } from "./oidcProviderUpdateOptionsSchema.js"

/**
 * `x:OidcProvider/set` — update the singleton OidcProvider object.
 * Singletons update id `"singleton"`; durations are millisecond numbers.
 */
export async function oidcProviderUpdate(
  options: OidcProviderUpdateOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "oidcProviderUpdate"
  const parsed = a.safeParse(oidcProviderUpdateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({
    config: parsed.output.config,
    objectType: "OidcProvider" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    update: { [REGISTRY_SINGLETON_ID]: parsed.output.patch },
  })
}
