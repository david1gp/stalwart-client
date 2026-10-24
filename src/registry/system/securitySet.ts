import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { securitySetOptionsSchema, type SecuritySetOptions } from "./securitySetOptionsSchema.js"

/**
 * `x:Security/set` — patch the automatic IP banning rules singleton.
 * Any `notUpdated` entry becomes a ResultErr via `jmapSetErrorCheck`.
 */
export async function securitySet(options: SecuritySetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "securitySet"
  const parsed = a.safeParse(securitySetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const response = await registrySet({
    config: parsed.output.config,
    objectType: "Security",
    update: { singleton: parsed.output.patch },
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
  })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
