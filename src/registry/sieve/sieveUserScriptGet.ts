import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistrySieveUserScript } from "../generated/RegistrySieveUserScript.js"
import { sieveUserScriptGetOptionsSchema, type SieveUserScriptGetOptions } from "./sieveUserScriptGetOptionsSchema.js"

/**
 * `x:SieveUserScript/get` — Defines a global Sieve script available for user imports. Contents are compiled on set; failures surface as invalidProperties on contents. Source: crates/jmap/src/registry/mapping/sieve.rs.
 */
export async function sieveUserScriptGet(
  options: SieveUserScriptGetOptions,
): PromiseResult<JmapGetResponse<RegistrySieveUserScript>> {
  const op = "sieveUserScriptGet"
  const parsed = a.safeParse(sieveUserScriptGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "SieveUserScript" })
}
