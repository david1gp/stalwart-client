import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryObjectMap } from "../generated/RegistryObjectMap.js"
import { registryGet } from "../registryGet.js"
import { domainGetOptionsSchema, type DomainGetOptions } from "./domainGetOptionsSchema.js"

/**
 * `x:Domain/get` — fetch email domain and its DNS, DKIM, and TLS certificate settings by id (all of them when `ids` is omitted).
 */
export async function domainGet(
  options: DomainGetOptions,
): PromiseResult<JmapGetResponse<RegistryObjectMap["Domain"]>> {
  const op = "domainGet"
  const parsed = a.safeParse(domainGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "Domain" })
}
