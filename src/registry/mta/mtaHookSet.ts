import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { mtaHookSetOptionsSchema, type MtaHookSetOptions } from "./mtaHookSetOptionsSchema.js"

/**
 * `x:MtaHook/set` — create, update and/or destroy MTA hook endpoint for message processing.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry becomes a ResultErr.
 */
export async function mtaHookSet(options: MtaHookSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "mtaHookSet"
  const parsed = a.safeParse(mtaHookSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "MtaHook" })
}
