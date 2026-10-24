import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistryInMemoryStore } from "../generated/RegistryInMemoryStore.js"
import { type InMemoryStoreGetOptions, inMemoryStoreGetOptionsSchema } from "./inMemoryStoreGetOptionsSchema.js"

/**
 * `x:InMemoryStore/get` — fetch the in-memory cache/lookup store singleton
 * (`Default`, `Sharded`, `Redis`, `RedisCluster` or `RedisSentinel`).
 * Read-only in practice: repointing the store breaks the server.
 */
export async function inMemoryStoreGet(
  options: InMemoryStoreGetOptions,
): PromiseResult<JmapGetResponse<RegistryInMemoryStore>> {
  const op = "inMemoryStoreGet"
  const parsed = a.safeParse(inMemoryStoreGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryGet({ config, objectType: "InMemoryStore", ...args })
}
