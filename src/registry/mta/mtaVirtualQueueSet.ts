import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { mtaVirtualQueueSetOptionsSchema, type MtaVirtualQueueSetOptions } from "./mtaVirtualQueueSetOptionsSchema.js"

/**
 * `x:MtaVirtualQueue/set` — create, update and/or destroy virtual queue for organizing outbound message delivery.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry becomes a ResultErr.
 */
export async function mtaVirtualQueueSet(
  options: MtaVirtualQueueSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "mtaVirtualQueueSet"
  const parsed = a.safeParse(mtaVirtualQueueSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "MtaVirtualQueue" })
}
