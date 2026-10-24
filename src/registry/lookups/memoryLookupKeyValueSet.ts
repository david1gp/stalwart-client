import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import {
  memoryLookupKeyValueSetOptionsSchema,
  type MemoryLookupKeyValueSetOptions,
} from "./memoryLookupKeyValueSetOptionsSchema.js"

/**
 * `x:MemoryLookupKeyValue/set` — Defines an in-memory lookup key-value pair.
 */
export async function memoryLookupKeyValueSet(
  options: MemoryLookupKeyValueSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "memoryLookupKeyValueSet"
  const parsed = a.safeParse(memoryLookupKeyValueSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "MemoryLookupKeyValue" })
}
