import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryObjectMap } from "../generated/RegistryObjectMap.js"
import { registryGet } from "../registryGet.js"
import { mtaVirtualQueueGetOptionsSchema, type MtaVirtualQueueGetOptions } from "./mtaVirtualQueueGetOptionsSchema.js"

/**
 * `x:MtaVirtualQueue/get` — fetch virtual queue for organizing outbound message delivery by id (all of them when `ids` is omitted).
 */
export async function mtaVirtualQueueGet(
  options: MtaVirtualQueueGetOptions,
): PromiseResult<JmapGetResponse<RegistryObjectMap["MtaVirtualQueue"]>> {
  const op = "mtaVirtualQueueGet"
  const parsed = a.safeParse(mtaVirtualQueueGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "MtaVirtualQueue" })
}
