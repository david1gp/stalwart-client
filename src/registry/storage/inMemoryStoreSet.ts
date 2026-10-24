import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type InMemoryStoreSetOptions, inMemoryStoreSetOptionsSchema } from "./inMemoryStoreSetOptionsSchema.js"

/**
 * `x:InMemoryStore/set` — update the in-memory cache/lookup store singleton
 * (under the `"singleton"` id). Dangerous: repointing the store breaks the
 * server — mock-tested only, never run against a live instance.
 */
export async function inMemoryStoreSet(
  options: InMemoryStoreSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "inMemoryStoreSet"
  const parsed = a.safeParse(inMemoryStoreSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  const response = await registrySet({ config, objectType: "InMemoryStore", ...args })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
