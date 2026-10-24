import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type CacheSetOptions, cacheSetOptionsSchema } from "./cacheSetOptionsSchema.js"

/**
 * `x:Cache/set` — update the in-memory cache size singleton
 * (under the `"singleton"` id). Reversible: read with `cacheGet`, patch one
 * size, then restore. Any non-empty `notUpdated` entry makes the whole call a
 * ResultErr carrying the full SetResponse in `errorData`.
 */
export async function cacheSet(options: CacheSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "cacheSet"
  const parsed = a.safeParse(cacheSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  const response = await registrySet({ config, objectType: "Cache", ...args })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
