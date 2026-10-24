import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryObjectMap } from "../generated/RegistryObjectMap.js"
import { registryGet } from "../registryGet.js"
import { mtaStageMailGetOptionsSchema, type MtaStageMailGetOptions } from "./mtaStageMailGetOptionsSchema.js"

/**
 * `x:MtaStageMail/get` — fetch MAIL FROM stage processing and sender validation by id (all of them when `ids` is omitted).
 */
export async function mtaStageMailGet(
  options: MtaStageMailGetOptions,
): PromiseResult<JmapGetResponse<RegistryObjectMap["MtaStageMail"]>> {
  const op = "mtaStageMailGet"
  const parsed = a.safeParse(mtaStageMailGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "MtaStageMail" })
}
