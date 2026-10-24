import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { systemSettingsSetOptionsSchema, type SystemSettingsSetOptions } from "./systemSettingsSetOptionsSchema.js"

/**
 * `x:SystemSettings/set` — patch the core server settings singleton.
 * Any `notUpdated` entry becomes a ResultErr via `jmapSetErrorCheck`.
 */
export async function systemSettingsSet(
  options: SystemSettingsSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "systemSettingsSet"
  const parsed = a.safeParse(systemSettingsSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const response = await registrySet({
    config: parsed.output.config,
    objectType: "SystemSettings",
    update: { singleton: parsed.output.patch },
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
  })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
