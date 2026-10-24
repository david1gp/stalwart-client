import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { mtaMilterSetOptionsSchema, type MtaMilterSetOptions } from "./mtaMilterSetOptionsSchema.js"

/**
 * `x:MtaMilter/set` — create, update and/or destroy Milter filter endpoint for message processing.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry becomes a ResultErr.
 */
export async function mtaMilterSet(options: MtaMilterSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "mtaMilterSet"
  const parsed = a.safeParse(mtaMilterSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "MtaMilter" })
}
