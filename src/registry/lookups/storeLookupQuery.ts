import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { storeLookupQueryOptionsSchema, type StoreLookupQueryOptions } from "./storeLookupQueryOptionsSchema.js"

/**
 * `x:StoreLookup/query` — Defines an external store used for lookups.
 */
export async function storeLookupQuery(options: StoreLookupQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "storeLookupQuery"
  const parsed = a.safeParse(storeLookupQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "StoreLookup" })
}
