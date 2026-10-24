import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import {
  mtaInboundThrottleSetOptionsSchema,
  type MtaInboundThrottleSetOptions,
} from "./mtaInboundThrottleSetOptionsSchema.js"

/**
 * `x:MtaInboundThrottle/set` — create, update and/or destroy inbound rate limit rule for SMTP connections.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry becomes a ResultErr.
 */
export async function mtaInboundThrottleSet(
  options: MtaInboundThrottleSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "mtaInboundThrottleSet"
  const parsed = a.safeParse(mtaInboundThrottleSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "MtaInboundThrottle" })
}
