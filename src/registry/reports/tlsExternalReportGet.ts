import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistryTlsExternalReport } from "../generated/RegistryTlsExternalReport.js"
import {
  type TlsExternalReportGetOptions,
  tlsExternalReportGetOptionsSchema,
} from "./tlsExternalReportGetOptionsSchema.js"

/**
 * `x:TlsExternalReport/get` — fetch stored inbound TLS aggregate reports by id.
 * Reports are read-only apart from destroy: create always fails with
 * "Reports cannot be created" and update always fails with
 * "External reports cannot be updated"
 * (`crates/jmap/src/registry/mapping/report.rs:36-37,109-110`).
 */
export async function tlsExternalReportGet(
  options: TlsExternalReportGetOptions,
): PromiseResult<JmapGetResponse<RegistryTlsExternalReport>> {
  const op = "tlsExternalReportGet"
  const parsed = a.safeParse(tlsExternalReportGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryGet({ config, objectType: "TlsExternalReport", ...args })
}
