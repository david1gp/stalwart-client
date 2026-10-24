import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistryTlsInternalReport } from "../generated/RegistryTlsInternalReport.js"
import {
  type TlsInternalReportGetOptions,
  tlsInternalReportGetOptionsSchema,
} from "./tlsInternalReportGetOptionsSchema.js"

/**
 * `x:TlsInternalReport/get` — fetch outbound TLS aggregate reports pending delivery.
 * Internal reports cannot be created ("Reports cannot be created"); update only
 * accepts a future `deliverAt` to reschedule delivery
 * (`crates/jmap/src/registry/mapping/report.rs:36-37,42-102`).
 */
export async function tlsInternalReportGet(
  options: TlsInternalReportGetOptions,
): PromiseResult<JmapGetResponse<RegistryTlsInternalReport>> {
  const op = "tlsInternalReportGet"
  const parsed = a.safeParse(tlsInternalReportGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryGet({ config, objectType: "TlsInternalReport", ...args })
}
