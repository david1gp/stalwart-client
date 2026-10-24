import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistryMemoryLookupKeyValue } from "../generated/RegistryMemoryLookupKeyValue.js"
import {
  memoryLookupKeyValueGetOptionsSchema,
  type MemoryLookupKeyValueGetOptions,
} from "./memoryLookupKeyValueGetOptionsSchema.js"

/**
 * `x:MemoryLookupKeyValue/get` — Defines an in-memory lookup key-value pair.
 */
export async function memoryLookupKeyValueGet(
  options: MemoryLookupKeyValueGetOptions,
): PromiseResult<JmapGetResponse<RegistryMemoryLookupKeyValue>> {
  const op = "memoryLookupKeyValueGet"
  const parsed = a.safeParse(memoryLookupKeyValueGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "MemoryLookupKeyValue" })
}
