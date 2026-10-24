import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import {
  mtaOutboundThrottleSetOptionsSchema,
  type MtaOutboundThrottleSetOptions,
} from "./mtaOutboundThrottleSetOptionsSchema.js"

/**
 * `x:MtaOutboundThrottle/set` — create, update and/or destroy outbound rate limit rule for message delivery.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry becomes a ResultErr.
 */
export async function mtaOutboundThrottleSet(
  options: MtaOutboundThrottleSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "mtaOutboundThrottleSet"
  const parsed = a.safeParse(mtaOutboundThrottleSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "MtaOutboundThrottle" })
}
