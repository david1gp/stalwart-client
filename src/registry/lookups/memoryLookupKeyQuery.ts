import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import {
  memoryLookupKeyQueryOptionsSchema,
  type MemoryLookupKeyQueryOptions,
} from "./memoryLookupKeyQueryOptionsSchema.js"

/**
 * `x:MemoryLookupKey/query` — Defines an in-memory lookup key for fast data access.
 */
export async function memoryLookupKeyQuery(options: MemoryLookupKeyQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "memoryLookupKeyQuery"
  const parsed = a.safeParse(memoryLookupKeyQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "MemoryLookupKey" })
}
