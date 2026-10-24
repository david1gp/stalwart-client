import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistrySieveSystemScript } from "../generated/RegistrySieveSystemScript.js"
import {
  sieveSystemScriptGetOptionsSchema,
  type SieveSystemScriptGetOptions,
} from "./sieveSystemScriptGetOptionsSchema.js"

/**
 * `x:SieveSystemScript/get` — Defines a system Sieve script executed by the server. Contents are compiled on set; failures surface as invalidProperties on contents. Source: crates/jmap/src/registry/mapping/sieve.rs.
 */
export async function sieveSystemScriptGet(
  options: SieveSystemScriptGetOptions,
): PromiseResult<JmapGetResponse<RegistrySieveSystemScript>> {
  const op = "sieveSystemScriptGet"
  const parsed = a.safeParse(sieveSystemScriptGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "SieveSystemScript" })
}
