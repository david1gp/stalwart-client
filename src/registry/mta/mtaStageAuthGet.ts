import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryObjectMap } from "../generated/RegistryObjectMap.js"
import { registryGet } from "../registryGet.js"
import { mtaStageAuthGetOptionsSchema, type MtaStageAuthGetOptions } from "./mtaStageAuthGetOptionsSchema.js"

/**
 * `x:MtaStageAuth/get` — fetch SMTP authentication requirements and error handling by id (all of them when `ids` is omitted).
 */
export async function mtaStageAuthGet(
  options: MtaStageAuthGetOptions,
): PromiseResult<JmapGetResponse<RegistryObjectMap["MtaStageAuth"]>> {
  const op = "mtaStageAuthGet"
  const parsed = a.safeParse(mtaStageAuthGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "MtaStageAuth" })
}
