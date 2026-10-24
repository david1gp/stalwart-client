import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import {
  sieveSystemInterpreterSetOptionsSchema,
  type SieveSystemInterpreterSetOptions,
} from "./sieveSystemInterpreterSetOptionsSchema.js"

/**
 * `x:SieveSystemInterpreter/set` — Configures the system-level Sieve script interpreter settings and limits.
 */
export async function sieveSystemInterpreterSet(
  options: SieveSystemInterpreterSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "sieveSystemInterpreterSet"
  const parsed = a.safeParse(sieveSystemInterpreterSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "SieveSystemInterpreter" })
}
