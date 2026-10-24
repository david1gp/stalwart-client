import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { memoryLookupKeySetOptionsSchema, type MemoryLookupKeySetOptions } from "./memoryLookupKeySetOptionsSchema.js"

/**
 * `x:MemoryLookupKey/set` — Defines an in-memory lookup key for fast data access.
 */
export async function memoryLookupKeySet(
  options: MemoryLookupKeySetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "memoryLookupKeySet"
  const parsed = a.safeParse(memoryLookupKeySetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "MemoryLookupKey" })
}
