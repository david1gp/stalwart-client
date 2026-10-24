import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import {
  type ArfExternalReportQueryOptions,
  arfExternalReportQueryOptionsSchema,
} from "./arfExternalReportQueryOptionsSchema.js"

/**
 * `x:ArfExternalReport/query` — list stored ARF feedback report ids.
 * Supported filters (`crates/jmap/src/registry/mapping/report.rs:279-330`):
 * `text`, `memberTenantId`, `totalFailedSessions` (plus `IsGreaterThan`,
 * `IsGreaterThanOrEqual`, `IsLessThan`, `IsLessThanOrEqual` variants),
 * `totalSuccessfulSessions` (plus `Is*` variants) and `expiresAt` (plus `Is*`
 * variants, UTC date-time strings).
 */
export async function arfExternalReportQuery(options: ArfExternalReportQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "arfExternalReportQuery"
  const parsed = a.safeParse(arfExternalReportQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryQuery({ config, objectType: "ArfExternalReport", ...args })
}
