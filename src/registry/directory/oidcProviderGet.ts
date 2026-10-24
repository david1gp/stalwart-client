import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryOidcProvider } from "../generated/RegistryOidcProvider.js"
import { registryGet } from "../registryGet.js"
import { type OidcProviderGetOptions, oidcProviderGetOptionsSchema } from "./oidcProviderGetOptionsSchema.js"

/**
 * `x:OidcProvider/get` — fetch the singleton OidcProvider object.
 */
export async function oidcProviderGet(
  options: OidcProviderGetOptions,
): PromiseResult<JmapGetResponse<RegistryOidcProvider & { id: string }>> {
  const op = "oidcProviderGet"
  const parsed = a.safeParse(oidcProviderGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registryGet({ config, objectType: "OidcProvider" as const, ...rest })
}
