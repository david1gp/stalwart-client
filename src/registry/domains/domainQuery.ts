import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { domainQueryOptionsSchema, type DomainQueryOptions } from "./domainQueryOptionsSchema.js"

/**
 * `x:Domain/query` — list email domain and its DNS, DKIM, and TLS certificate settings ids with an optional filter/sort/page.
 */
export async function domainQuery(options: DomainQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "domainQuery"
  const parsed = a.safeParse(domainQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "Domain" })
}
