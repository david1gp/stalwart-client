import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryObjectMap } from "../generated/RegistryObjectMap.js"
import { registryGet } from "../registryGet.js"
import { mtaQueueQuotaGetOptionsSchema, type MtaQueueQuotaGetOptions } from "./mtaQueueQuotaGetOptionsSchema.js"

/**
 * `x:MtaQueueQuota/get` — fetch quota rule for message queues by id (all of them when `ids` is omitted).
 */
export async function mtaQueueQuotaGet(
  options: MtaQueueQuotaGetOptions,
): PromiseResult<JmapGetResponse<RegistryObjectMap["MtaQueueQuota"]>> {
  const op = "mtaQueueQuotaGet"
  const parsed = a.safeParse(mtaQueueQuotaGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "MtaQueueQuota" })
}
