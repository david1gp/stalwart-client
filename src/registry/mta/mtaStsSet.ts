import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { mtaStsSetOptionsSchema, type MtaStsSetOptions } from "./mtaStsSetOptionsSchema.js"

/**
 * `x:MtaSts/set` — create, update and/or destroy MTA-STS policy for the server.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry becomes a ResultErr.
 */
export async function mtaStsSet(options: MtaStsSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "mtaStsSet"
  const parsed = a.safeParse(mtaStsSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "MtaSts" })
}
