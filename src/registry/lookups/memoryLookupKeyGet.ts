import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistryMemoryLookupKey } from "../generated/RegistryMemoryLookupKey.js"
import { memoryLookupKeyGetOptionsSchema, type MemoryLookupKeyGetOptions } from "./memoryLookupKeyGetOptionsSchema.js"

/**
 * `x:MemoryLookupKey/get` — Defines an in-memory lookup key for fast data access.
 */
export async function memoryLookupKeyGet(
  options: MemoryLookupKeyGetOptions,
): PromiseResult<JmapGetResponse<RegistryMemoryLookupKey>> {
  const op = "memoryLookupKeyGet"
  const parsed = a.safeParse(memoryLookupKeyGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "MemoryLookupKey" })
}
