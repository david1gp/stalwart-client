import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { dnsServerQueryOptionsSchema, type DnsServerQueryOptions } from "./dnsServerQueryOptionsSchema.js"

/**
 * `x:DnsServer/query` — list DNS server for automatic record management ids with an optional filter/sort/page.
 */
export async function dnsServerQuery(options: DnsServerQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "dnsServerQuery"
  const parsed = a.safeParse(dnsServerQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "DnsServer" })
}
