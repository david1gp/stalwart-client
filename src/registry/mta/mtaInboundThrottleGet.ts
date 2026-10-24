import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryObjectMap } from "../generated/RegistryObjectMap.js"
import { registryGet } from "../registryGet.js"
import {
  mtaInboundThrottleGetOptionsSchema,
  type MtaInboundThrottleGetOptions,
} from "./mtaInboundThrottleGetOptionsSchema.js"

/**
 * `x:MtaInboundThrottle/get` — fetch inbound rate limit rule for SMTP connections by id (all of them when `ids` is omitted).
 */
export async function mtaInboundThrottleGet(
  options: MtaInboundThrottleGetOptions,
): PromiseResult<JmapGetResponse<RegistryObjectMap["MtaInboundThrottle"]>> {
  const op = "mtaInboundThrottleGet"
  const parsed = a.safeParse(mtaInboundThrottleGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "MtaInboundThrottle" })
}
