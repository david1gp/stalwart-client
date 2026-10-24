import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { type AlertQueryOptions, alertQueryOptionsSchema } from "./alertQueryOptionsSchema.js"

/**
 * `x:Alert/query` — list metric-condition alert rule ids.
 * Standard registry filters (property equality and `Is*` comparisons).
 */
export async function alertQuery(options: AlertQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "alertQuery"
  const parsed = a.safeParse(alertQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryQuery({ config, objectType: "Alert", ...args })
}
