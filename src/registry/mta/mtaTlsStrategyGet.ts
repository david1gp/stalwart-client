import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryObjectMap } from "../generated/RegistryObjectMap.js"
import { registryGet } from "../registryGet.js"
import { mtaTlsStrategyGetOptionsSchema, type MtaTlsStrategyGetOptions } from "./mtaTlsStrategyGetOptionsSchema.js"

/**
 * `x:MtaTlsStrategy/get` — fetch TLS security strategy for outbound connections by id (all of them when `ids` is omitted).
 */
export async function mtaTlsStrategyGet(
  options: MtaTlsStrategyGetOptions,
): PromiseResult<JmapGetResponse<RegistryObjectMap["MtaTlsStrategy"]>> {
  const op = "mtaTlsStrategyGet"
  const parsed = a.safeParse(mtaTlsStrategyGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "MtaTlsStrategy" })
}
