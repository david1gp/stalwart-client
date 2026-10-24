import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import {
  mtaConnectionStrategySetOptionsSchema,
  type MtaConnectionStrategySetOptions,
} from "./mtaConnectionStrategySetOptionsSchema.js"

/**
 * `x:MtaConnectionStrategy/set` — create, update and/or destroy connection strategy for outbound message delivery.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry becomes a ResultErr.
 */
export async function mtaConnectionStrategySet(
  options: MtaConnectionStrategySetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "mtaConnectionStrategySet"
  const parsed = a.safeParse(mtaConnectionStrategySetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "MtaConnectionStrategy" })
}
