import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import {
  networkListenerQueryOptionsSchema,
  type NetworkListenerQueryOptions,
} from "./networkListenerQueryOptionsSchema.js"

/**
 * `x:NetworkListener/query` — list network listener for accepting incoming connections ids with an optional filter/sort/page.
 */
export async function networkListenerQuery(options: NetworkListenerQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "networkListenerQuery"
  const parsed = a.safeParse(networkListenerQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "NetworkListener" })
}
