import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import {
  mtaOutboundStrategySetOptionsSchema,
  type MtaOutboundStrategySetOptions,
} from "./mtaOutboundStrategySetOptionsSchema.js"

/**
 * `x:MtaOutboundStrategy/set` — create, update and/or destroy outbound message delivery routing, scheduling, and TLS strategies.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry becomes a ResultErr.
 */
export async function mtaOutboundStrategySet(
  options: MtaOutboundStrategySetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "mtaOutboundStrategySet"
  const parsed = a.safeParse(mtaOutboundStrategySetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "MtaOutboundStrategy" })
}
