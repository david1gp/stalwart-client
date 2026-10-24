import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import {
  type TlsInternalReportQueryOptions,
  tlsInternalReportQueryOptionsSchema,
} from "./tlsInternalReportQueryOptionsSchema.js"

/**
 * `x:TlsInternalReport/query` — list outbound TLS aggregate reports pending delivery.
 * Supported filter (`crates/jmap/src/registry/mapping/report.rs:240-278`):
 * `domain` (equality only).
 */
export async function tlsInternalReportQuery(options: TlsInternalReportQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "tlsInternalReportQuery"
  const parsed = a.safeParse(tlsInternalReportQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryQuery({ config, objectType: "TlsInternalReport", ...args })
}
