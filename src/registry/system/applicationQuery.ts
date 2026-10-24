import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { applicationQueryOptionsSchema, type ApplicationQueryOptions } from "./applicationQueryOptionsSchema.js"

/**
 * `x:Application/query` — list web application ids with an optional
 * flat AND filter.
 */
export async function applicationQuery(options: ApplicationQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "applicationQuery"
  const parsed = a.safeParse(applicationQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "Application" })
}
