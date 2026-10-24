import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryObjectMap } from "../generated/RegistryObjectMap.js"
import { registryGet } from "../registryGet.js"
import { acmeProviderGetOptionsSchema, type AcmeProviderGetOptions } from "./acmeProviderGetOptionsSchema.js"

/**
 * `x:AcmeProvider/get` — fetch ACME provider for automatic TLS certificate management by id (all of them when `ids` is omitted).
 */
export async function acmeProviderGet(
  options: AcmeProviderGetOptions,
): PromiseResult<JmapGetResponse<RegistryObjectMap["AcmeProvider"]>> {
  const op = "acmeProviderGet"
  const parsed = a.safeParse(acmeProviderGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "AcmeProvider" })
}
