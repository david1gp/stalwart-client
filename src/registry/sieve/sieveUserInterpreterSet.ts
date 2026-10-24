import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import {
  sieveUserInterpreterSetOptionsSchema,
  type SieveUserInterpreterSetOptions,
} from "./sieveUserInterpreterSetOptionsSchema.js"

/**
 * `x:SieveUserInterpreter/set` — Configures the user-level Sieve script interpreter settings and limits.
 */
export async function sieveUserInterpreterSet(
  options: SieveUserInterpreterSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "sieveUserInterpreterSet"
  const parsed = a.safeParse(sieveUserInterpreterSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "SieveUserInterpreter" })
}
