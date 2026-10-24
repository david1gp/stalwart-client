import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { mtaStageMailSetOptionsSchema, type MtaStageMailSetOptions } from "./mtaStageMailSetOptionsSchema.js"

/**
 * `x:MtaStageMail/set` — create, update and/or destroy MAIL FROM stage processing and sender validation.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry becomes a ResultErr.
 */
export async function mtaStageMailSet(
  options: MtaStageMailSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "mtaStageMailSet"
  const parsed = a.safeParse(mtaStageMailSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "MtaStageMail" })
}
