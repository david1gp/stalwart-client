import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistryCache } from "../generated/RegistryCache.js"
import { type CacheGetOptions, cacheGetOptionsSchema } from "./cacheGetOptionsSchema.js"

/**
 * `x:Cache/get` — fetch the in-memory cache size singleton (per-cache entry
 * limits for data, DNS records and auth tokens).
 */
export async function cacheGet(options: CacheGetOptions): PromiseResult<JmapGetResponse<RegistryCache>> {
  const op = "cacheGet"
  const parsed = a.safeParse(cacheGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryGet({ config, objectType: "Cache", ...args })
}
