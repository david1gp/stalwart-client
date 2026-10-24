import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { mtaStageAuthSetOptionsSchema, type MtaStageAuthSetOptions } from "./mtaStageAuthSetOptionsSchema.js"

/**
 * `x:MtaStageAuth/set` — create, update and/or destroy SMTP authentication requirements and error handling.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry becomes a ResultErr.
 */
export async function mtaStageAuthSet(
  options: MtaStageAuthSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "mtaStageAuthSet"
  const parsed = a.safeParse(mtaStageAuthSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "MtaStageAuth" })
}
