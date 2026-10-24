import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryObjectMap } from "../generated/RegistryObjectMap.js"
import { registryGet } from "../registryGet.js"
import { mtaStageConnectGetOptionsSchema, type MtaStageConnectGetOptions } from "./mtaStageConnectGetOptionsSchema.js"

/**
 * `x:MtaStageConnect/get` — fetch SMTP connection greeting and hostname settings by id (all of them when `ids` is omitted).
 */
export async function mtaStageConnectGet(
  options: MtaStageConnectGetOptions,
): PromiseResult<JmapGetResponse<RegistryObjectMap["MtaStageConnect"]>> {
  const op = "mtaStageConnectGet"
  const parsed = a.safeParse(mtaStageConnectGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "MtaStageConnect" })
}
