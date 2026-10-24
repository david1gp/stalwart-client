import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { mtaStageRcptSetOptionsSchema, type MtaStageRcptSetOptions } from "./mtaStageRcptSetOptionsSchema.js"

/**
 * `x:MtaStageRcpt/set` — create, update and/or destroy RCPT TO stage processing and recipient validation.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry becomes a ResultErr.
 */
export async function mtaStageRcptSet(
  options: MtaStageRcptSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "mtaStageRcptSet"
  const parsed = a.safeParse(mtaStageRcptSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "MtaStageRcpt" })
}
