import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryObjectMap } from "../generated/RegistryObjectMap.js"
import { registryGet } from "../registryGet.js"
import { dnsResolverGetOptionsSchema, type DnsResolverGetOptions } from "./dnsResolverGetOptionsSchema.js"

/**
 * `x:DnsResolver/get` — fetch DNS resolver used for domain lookups by id (all of them when `ids` is omitted).
 */
export async function dnsResolverGet(
  options: DnsResolverGetOptions,
): PromiseResult<JmapGetResponse<RegistryObjectMap["DnsResolver"]>> {
  const op = "dnsResolverGet"
  const parsed = a.safeParse(dnsResolverGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "DnsResolver" })
}
