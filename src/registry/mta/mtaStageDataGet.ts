import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryObjectMap } from "../generated/RegistryObjectMap.js"
import { registryGet } from "../registryGet.js"
import { mtaStageDataGetOptionsSchema, type MtaStageDataGetOptions } from "./mtaStageDataGetOptionsSchema.js"

/**
 * `x:MtaStageData/get` — fetch message processing rules for the SMTP DATA stage by id (all of them when `ids` is omitted).
 */
export async function mtaStageDataGet(
  options: MtaStageDataGetOptions,
): PromiseResult<JmapGetResponse<RegistryObjectMap["MtaStageData"]>> {
  const op = "mtaStageDataGet"
  const parsed = a.safeParse(mtaStageDataGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "MtaStageData" })
}
