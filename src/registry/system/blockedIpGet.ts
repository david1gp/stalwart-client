import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryBlockedIp } from "../generated/RegistryBlockedIp.js"
import { registryGet } from "../registryGet.js"
import { blockedIpGetOptionsSchema, type BlockedIpGetOptions } from "./blockedIpGetOptionsSchema.js"

/**
 * `x:BlockedIp/get` — fetch blocked IP addresses or network ranges by id.
 */
export async function blockedIpGet(
  options: BlockedIpGetOptions,
): PromiseResult<JmapGetResponse<RegistryBlockedIp & { id: string }>> {
  const op = "blockedIpGet"
  const parsed = a.safeParse(blockedIpGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "BlockedIp" })
}
