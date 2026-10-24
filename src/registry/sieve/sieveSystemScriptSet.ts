import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import {
  sieveSystemScriptSetOptionsSchema,
  type SieveSystemScriptSetOptions,
} from "./sieveSystemScriptSetOptionsSchema.js"

/**
 * `x:SieveSystemScript/set` — Defines a system Sieve script executed by the server. Contents are compiled on set; failures surface as invalidProperties on contents. Source: crates/jmap/src/registry/mapping/sieve.rs.
 */
export async function sieveSystemScriptSet(
  options: SieveSystemScriptSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "sieveSystemScriptSet"
  const parsed = a.safeParse(sieveSystemScriptSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "SieveSystemScript" })
}
