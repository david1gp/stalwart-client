import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import {
  type DmarcInternalReportQueryOptions,
  dmarcInternalReportQueryOptionsSchema,
} from "./dmarcInternalReportQueryOptionsSchema.js"

/**
 * `x:DmarcInternalReport/query` — list outbound DMARC aggregate reports pending delivery.
 * Supported filter (`crates/jmap/src/registry/mapping/report.rs:240-278`):
 * `domain` (equality plus `IsGreaterThan`, `IsGreaterThanOrEqual`,
 * `IsLessThan` and `IsLessThanOrEqual` variants, matched over a
 * domain+timestamp composite key).
 */
export async function dmarcInternalReportQuery(
  options: DmarcInternalReportQueryOptions,
): PromiseResult<JmapQueryResponse> {
  const op = "dmarcInternalReportQuery"
  const parsed = a.safeParse(dmarcInternalReportQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryQuery({ config, objectType: "DmarcInternalReport", ...args })
}
