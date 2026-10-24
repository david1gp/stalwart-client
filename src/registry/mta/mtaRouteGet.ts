import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryObjectMap } from "../generated/RegistryObjectMap.js"
import { registryGet } from "../registryGet.js"
import { mtaRouteGetOptionsSchema, type MtaRouteGetOptions } from "./mtaRouteGetOptionsSchema.js"

/**
 * `x:MtaRoute/get` — fetch routing rule for outbound message delivery by id (all of them when `ids` is omitted).
 */
export async function mtaRouteGet(
  options: MtaRouteGetOptions,
): PromiseResult<JmapGetResponse<RegistryObjectMap["MtaRoute"]>> {
  const op = "mtaRouteGet"
  const parsed = a.safeParse(mtaRouteGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "MtaRoute" })
}
