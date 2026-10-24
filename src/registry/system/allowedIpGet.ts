import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryAllowedIp } from "../generated/RegistryAllowedIp.js"
import { registryGet } from "../registryGet.js"
import { allowedIpGetOptionsSchema, type AllowedIpGetOptions } from "./allowedIpGetOptionsSchema.js"

/**
 * `x:AllowedIp/get` — fetch allowed IP addresses or network ranges by id.
 */
export async function allowedIpGet(
  options: AllowedIpGetOptions,
): PromiseResult<JmapGetResponse<RegistryAllowedIp & { id: string }>> {
  const op = "allowedIpGet"
  const parsed = a.safeParse(allowedIpGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "AllowedIp" })
}
