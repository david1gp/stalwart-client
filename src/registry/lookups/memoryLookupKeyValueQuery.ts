import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import {
  memoryLookupKeyValueQueryOptionsSchema,
  type MemoryLookupKeyValueQueryOptions,
} from "./memoryLookupKeyValueQueryOptionsSchema.js"

/**
 * `x:MemoryLookupKeyValue/query` — Defines an in-memory lookup key-value pair.
 */
export async function memoryLookupKeyValueQuery(
  options: MemoryLookupKeyValueQueryOptions,
): PromiseResult<JmapQueryResponse> {
  const op = "memoryLookupKeyValueQuery"
  const parsed = a.safeParse(memoryLookupKeyValueQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "MemoryLookupKeyValue" })
}
