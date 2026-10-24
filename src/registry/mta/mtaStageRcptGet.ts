import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryObjectMap } from "../generated/RegistryObjectMap.js"
import { registryGet } from "../registryGet.js"
import { mtaStageRcptGetOptionsSchema, type MtaStageRcptGetOptions } from "./mtaStageRcptGetOptionsSchema.js"

/**
 * `x:MtaStageRcpt/get` — fetch RCPT TO stage processing and recipient validation by id (all of them when `ids` is omitted).
 */
export async function mtaStageRcptGet(
  options: MtaStageRcptGetOptions,
): PromiseResult<JmapGetResponse<RegistryObjectMap["MtaStageRcpt"]>> {
  const op = "mtaStageRcptGet"
  const parsed = a.safeParse(mtaStageRcptGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "MtaStageRcpt" })
}
