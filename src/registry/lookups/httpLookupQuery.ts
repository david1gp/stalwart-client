import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { httpLookupQueryOptionsSchema, type HttpLookupQueryOptions } from "./httpLookupQueryOptionsSchema.js"

/**
 * `x:HttpLookup/query` — Defines an HTTP-based lookup list.
 */
export async function httpLookupQuery(options: HttpLookupQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "httpLookupQuery"
  const parsed = a.safeParse(httpLookupQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "HttpLookup" })
}
