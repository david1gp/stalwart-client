import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryObjectMap } from "../generated/RegistryObjectMap.js"
import { registryGet } from "../registryGet.js"
import {
  mtaConnectionStrategyGetOptionsSchema,
  type MtaConnectionStrategyGetOptions,
} from "./mtaConnectionStrategyGetOptionsSchema.js"

/**
 * `x:MtaConnectionStrategy/get` — fetch connection strategy for outbound message delivery by id (all of them when `ids` is omitted).
 */
export async function mtaConnectionStrategyGet(
  options: MtaConnectionStrategyGetOptions,
): PromiseResult<JmapGetResponse<RegistryObjectMap["MtaConnectionStrategy"]>> {
  const op = "mtaConnectionStrategyGet"
  const parsed = a.safeParse(mtaConnectionStrategyGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "MtaConnectionStrategy" })
}
