import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { networkListenerSetOptionsSchema, type NetworkListenerSetOptions } from "./networkListenerSetOptionsSchema.js"

/**
 * `x:NetworkListener/set` — create, update and/or destroy network listener for accepting incoming connections.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry becomes a ResultErr.
 */
export async function networkListenerSet(
  options: NetworkListenerSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "networkListenerSet"
  const parsed = a.safeParse(networkListenerSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "NetworkListener" })
}
