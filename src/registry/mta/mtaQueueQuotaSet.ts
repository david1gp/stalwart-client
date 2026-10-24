import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { mtaQueueQuotaSetOptionsSchema, type MtaQueueQuotaSetOptions } from "./mtaQueueQuotaSetOptionsSchema.js"

/**
 * `x:MtaQueueQuota/set` — create, update and/or destroy quota rule for message queues.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry becomes a ResultErr.
 */
export async function mtaQueueQuotaSet(
  options: MtaQueueQuotaSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "mtaQueueQuotaSet"
  const parsed = a.safeParse(mtaQueueQuotaSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "MtaQueueQuota" })
}
