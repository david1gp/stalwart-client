import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryObjectMap } from "../generated/RegistryObjectMap.js"
import { registryGet } from "../registryGet.js"
import {
  mtaOutboundStrategyGetOptionsSchema,
  type MtaOutboundStrategyGetOptions,
} from "./mtaOutboundStrategyGetOptionsSchema.js"

/**
 * `x:MtaOutboundStrategy/get` — fetch outbound message delivery routing, scheduling, and TLS strategies by id (all of them when `ids` is omitted).
 */
export async function mtaOutboundStrategyGet(
  options: MtaOutboundStrategyGetOptions,
): PromiseResult<JmapGetResponse<RegistryObjectMap["MtaOutboundStrategy"]>> {
  const op = "mtaOutboundStrategyGet"
  const parsed = a.safeParse(mtaOutboundStrategyGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "MtaOutboundStrategy" })
}
