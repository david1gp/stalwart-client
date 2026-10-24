import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type AlertSetOptions, alertSetOptionsSchema } from "./alertSetOptionsSchema.js"

/**
 * `x:Alert/set` — create, update and/or destroy metric-condition alert rules.
 * Any non-empty `notCreated`/`notUpdated`/`notDestroyed` entry makes the whole
 * call a ResultErr carrying the full SetResponse in `errorData`.
 */
export async function alertSet(options: AlertSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "alertSet"
  const parsed = a.safeParse(alertSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  const response = await registrySet({ config, objectType: "Alert", ...args })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
