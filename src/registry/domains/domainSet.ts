import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { domainSetOptionsSchema, type DomainSetOptions } from "./domainSetOptionsSchema.js"

/**
 * `x:Domain/set` — create, update and/or destroy email domain and its DNS, DKIM, and TLS certificate settings.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry becomes a ResultErr.
 */
export async function domainSet(options: DomainSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "domainSet"
  const parsed = a.safeParse(domainSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "Domain" })
}
