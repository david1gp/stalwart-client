import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { dnsResolverSetOptionsSchema, type DnsResolverSetOptions } from "./dnsResolverSetOptionsSchema.js"

/**
 * `x:DnsResolver/set` — create, update and/or destroy DNS resolver used for domain lookups.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry becomes a ResultErr.
 */
export async function dnsResolverSet(options: DnsResolverSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "dnsResolverSet"
  const parsed = a.safeParse(dnsResolverSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "DnsResolver" })
}
