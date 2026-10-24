import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { dnsServerSetOptionsSchema, type DnsServerSetOptions } from "./dnsServerSetOptionsSchema.js"

/**
 * `x:DnsServer/set` — create, update and/or destroy DNS server for automatic record management.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry becomes a ResultErr.
 */
export async function dnsServerSet(options: DnsServerSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "dnsServerSet"
  const parsed = a.safeParse(dnsServerSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "DnsServer" })
}
