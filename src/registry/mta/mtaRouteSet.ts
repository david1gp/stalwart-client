import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { mtaRouteSetOptionsSchema, type MtaRouteSetOptions } from "./mtaRouteSetOptionsSchema.js"

/**
 * `x:MtaRoute/set` — create, update and/or destroy routing rule for outbound message delivery.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry becomes a ResultErr.
 */
export async function mtaRouteSet(options: MtaRouteSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "mtaRouteSet"
  const parsed = a.safeParse(mtaRouteSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "MtaRoute" })
}
