import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { mtaStageConnectSetOptionsSchema, type MtaStageConnectSetOptions } from "./mtaStageConnectSetOptionsSchema.js"

/**
 * `x:MtaStageConnect/set` — create, update and/or destroy SMTP connection greeting and hostname settings.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry becomes a ResultErr.
 */
export async function mtaStageConnectSet(
  options: MtaStageConnectSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "mtaStageConnectSet"
  const parsed = a.safeParse(mtaStageConnectSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "MtaStageConnect" })
}
