import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { sieveUserScriptSetOptionsSchema, type SieveUserScriptSetOptions } from "./sieveUserScriptSetOptionsSchema.js"

/**
 * `x:SieveUserScript/set` — Defines a global Sieve script available for user imports. Contents are compiled on set; failures surface as invalidProperties on contents. Source: crates/jmap/src/registry/mapping/sieve.rs.
 */
export async function sieveUserScriptSet(
  options: SieveUserScriptSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "sieveUserScriptSet"
  const parsed = a.safeParse(sieveUserScriptSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "SieveUserScript" })
}
