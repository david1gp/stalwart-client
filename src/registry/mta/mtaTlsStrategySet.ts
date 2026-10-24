import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { mtaTlsStrategySetOptionsSchema, type MtaTlsStrategySetOptions } from "./mtaTlsStrategySetOptionsSchema.js"

/**
 * `x:MtaTlsStrategy/set` — create, update and/or destroy TLS security strategy for outbound connections.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry becomes a ResultErr.
 */
export async function mtaTlsStrategySet(
  options: MtaTlsStrategySetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "mtaTlsStrategySet"
  const parsed = a.safeParse(mtaTlsStrategySetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "MtaTlsStrategy" })
}
