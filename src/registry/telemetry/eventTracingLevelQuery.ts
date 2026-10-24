import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import {
  type EventTracingLevelQueryOptions,
  eventTracingLevelQueryOptionsSchema,
} from "./eventTracingLevelQueryOptionsSchema.js"

/**
 * `x:EventTracingLevel/query` — list per-event logging level override ids.
 * The default registry query path only accepts filters on indexed properties;
 * `event` is not indexed, so a `{"event": "…"}` filter fails with
 * `unsupportedFilter: Filter on property event is not supported or invalid`
 * (verified against the local instance) — query unfiltered instead.
 */
export async function eventTracingLevelQuery(options: EventTracingLevelQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "eventTracingLevelQuery"
  const parsed = a.safeParse(eventTracingLevelQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryQuery({ config, objectType: "EventTracingLevel", ...args })
}
