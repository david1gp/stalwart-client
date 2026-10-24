import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { jmapSetOptionsSchema, type JmapSetOptions } from "./jmapSetOptionsSchema.js"

/**
 * `x:Jmap/set` — patch the JMAP protocol limits singleton.
 * Any `notUpdated` entry becomes a ResultErr via `jmapSetErrorCheck`.
 */
export async function jmapSet(options: JmapSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "jmapSet"
  const parsed = a.safeParse(jmapSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const response = await registrySet({
    config: parsed.output.config,
    objectType: "Jmap",
    update: { singleton: parsed.output.patch },
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
  })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
