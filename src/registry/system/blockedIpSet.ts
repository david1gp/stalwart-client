import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { blockedIpSetOptionsSchema, type BlockedIpSetOptions } from "./blockedIpSetOptionsSchema.js"

/**
 * `x:BlockedIp/set` — create, update and/or destroy blocked IP entries.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry becomes a ResultErr
 * via `jmapSetErrorCheck`. Prefer `blockedIpAdd`/`blockedIpRemove`.
 */
export async function blockedIpSet(options: BlockedIpSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "blockedIpSet"
  const parsed = a.safeParse(blockedIpSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const response = await registrySet({ ...parsed.output, objectType: "BlockedIp" })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
