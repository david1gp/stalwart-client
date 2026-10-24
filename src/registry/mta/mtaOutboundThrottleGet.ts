import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryObjectMap } from "../generated/RegistryObjectMap.js"
import { registryGet } from "../registryGet.js"
import {
  mtaOutboundThrottleGetOptionsSchema,
  type MtaOutboundThrottleGetOptions,
} from "./mtaOutboundThrottleGetOptionsSchema.js"

/**
 * `x:MtaOutboundThrottle/get` — fetch outbound rate limit rule for message delivery by id (all of them when `ids` is omitted).
 */
export async function mtaOutboundThrottleGet(
  options: MtaOutboundThrottleGetOptions,
): PromiseResult<JmapGetResponse<RegistryObjectMap["MtaOutboundThrottle"]>> {
  const op = "mtaOutboundThrottleGet"
  const parsed = a.safeParse(mtaOutboundThrottleGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "MtaOutboundThrottle" })
}
