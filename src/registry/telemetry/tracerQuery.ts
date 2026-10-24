import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { type TracerQueryOptions, tracerQueryOptionsSchema } from "./tracerQueryOptionsSchema.js"

/**
 * `x:Tracer/query` — list logging/tracing output definition ids.
 * Standard registry filters (property equality and `Is*` comparisons).
 */
export async function tracerQuery(options: TracerQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "tracerQuery"
  const parsed = a.safeParse(tracerQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryQuery({ config, objectType: "Tracer", ...args })
}
