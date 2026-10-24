import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryObjectMap } from "../generated/RegistryObjectMap.js"
import { registryGet } from "../registryGet.js"
import { mtaStageEhloGetOptionsSchema, type MtaStageEhloGetOptions } from "./mtaStageEhloGetOptionsSchema.js"

/**
 * `x:MtaStageEhlo/get` — fetch EHLO command requirements and validation by id (all of them when `ids` is omitted).
 */
export async function mtaStageEhloGet(
  options: MtaStageEhloGetOptions,
): PromiseResult<JmapGetResponse<RegistryObjectMap["MtaStageEhlo"]>> {
  const op = "mtaStageEhloGet"
  const parsed = a.safeParse(mtaStageEhloGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "MtaStageEhlo" })
}
