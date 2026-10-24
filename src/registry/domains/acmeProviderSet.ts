import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { acmeProviderSetOptionsSchema, type AcmeProviderSetOptions } from "./acmeProviderSetOptionsSchema.js"

/**
 * `x:AcmeProvider/set` — create, update and/or destroy ACME provider for automatic TLS certificate management.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry becomes a ResultErr.
 */
export async function acmeProviderSet(
  options: AcmeProviderSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "acmeProviderSet"
  const parsed = a.safeParse(acmeProviderSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "AcmeProvider" })
}
