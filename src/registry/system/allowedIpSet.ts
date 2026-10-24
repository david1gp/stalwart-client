import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { allowedIpSetOptionsSchema, type AllowedIpSetOptions } from "./allowedIpSetOptionsSchema.js"

/**
 * `x:AllowedIp/set` — create, update and/or destroy allowed IP entries.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry becomes a ResultErr
 * via `jmapSetErrorCheck`. Prefer `allowedIpAdd`/`allowedIpRemove`.
 */
export async function allowedIpSet(options: AllowedIpSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "allowedIpSet"
  const parsed = a.safeParse(allowedIpSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const response = await registrySet({ ...parsed.output, objectType: "AllowedIp" })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
