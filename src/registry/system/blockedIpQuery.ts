import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { blockedIpQueryOptionsSchema, type BlockedIpQueryOptions } from "./blockedIpQueryOptionsSchema.js"

/**
 * `x:BlockedIp/query` — list blocked IP entry ids with an optional
 * flat AND filter (e.g. `{ address: "198.51.100.7" }`).
 */
export async function blockedIpQuery(options: BlockedIpQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "blockedIpQuery"
  const parsed = a.safeParse(blockedIpQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "BlockedIp" })
}
