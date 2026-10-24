import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { mtaStageDataSetOptionsSchema, type MtaStageDataSetOptions } from "./mtaStageDataSetOptionsSchema.js"

/**
 * `x:MtaStageData/set` — create, update and/or destroy message processing rules for the SMTP DATA stage.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry becomes a ResultErr.
 */
export async function mtaStageDataSet(
  options: MtaStageDataSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "mtaStageDataSet"
  const parsed = a.safeParse(mtaStageDataSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "MtaStageData" })
}
