import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryObjectMap } from "../generated/RegistryObjectMap.js"
import { registryGet } from "../registryGet.js"
import { networkListenerGetOptionsSchema, type NetworkListenerGetOptions } from "./networkListenerGetOptionsSchema.js"

/**
 * `x:NetworkListener/get` — fetch network listener for accepting incoming connections by id (all of them when `ids` is omitted).
 */
export async function networkListenerGet(
  options: NetworkListenerGetOptions,
): PromiseResult<JmapGetResponse<RegistryObjectMap["NetworkListener"]>> {
  const op = "networkListenerGet"
  const parsed = a.safeParse(networkListenerGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "NetworkListener" })
}
