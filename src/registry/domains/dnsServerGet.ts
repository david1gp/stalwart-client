import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryObjectMap } from "../generated/RegistryObjectMap.js"
import { registryGet } from "../registryGet.js"
import { dnsServerGetOptionsSchema, type DnsServerGetOptions } from "./dnsServerGetOptionsSchema.js"

/**
 * `x:DnsServer/get` — fetch DNS server for automatic record management by id (all of them when `ids` is omitted).
 */
export async function dnsServerGet(
  options: DnsServerGetOptions,
): PromiseResult<JmapGetResponse<RegistryObjectMap["DnsServer"]>> {
  const op = "dnsServerGet"
  const parsed = a.safeParse(dnsServerGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "DnsServer" })
}
