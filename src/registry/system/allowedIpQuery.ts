import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { allowedIpQueryOptionsSchema, type AllowedIpQueryOptions } from "./allowedIpQueryOptionsSchema.js"

/**
 * `x:AllowedIp/query` — list allowed IP entry ids with an optional
 * flat AND filter (e.g. `{ address: "192.0.2.1" }`).
 */
export async function allowedIpQuery(options: AllowedIpQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "allowedIpQuery"
  const parsed = a.safeParse(allowedIpQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "AllowedIp" })
}
