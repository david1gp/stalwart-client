import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import {
  type TlsExternalReportQueryOptions,
  tlsExternalReportQueryOptionsSchema,
} from "./tlsExternalReportQueryOptionsSchema.js"

/**
 * `x:TlsExternalReport/query` — list stored inbound TLS aggregate report ids.
 * Supported filters (`crates/jmap/src/registry/mapping/report.rs:279-330`):
 * `text`, `memberTenantId`, `totalFailedSessions` (plus `IsGreaterThan`,
 * `IsGreaterThanOrEqual`, `IsLessThan`, `IsLessThanOrEqual` variants),
 * `totalSuccessfulSessions` (plus `Is*` variants) and `expiresAt` (plus `Is*`
 * variants, UTC date-time strings).
 */
export async function tlsExternalReportQuery(options: TlsExternalReportQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "tlsExternalReportQuery"
  const parsed = a.safeParse(tlsExternalReportQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryQuery({ config, objectType: "TlsExternalReport", ...args })
}
