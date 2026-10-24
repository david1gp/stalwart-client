import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistryDmarcInternalReport } from "../generated/RegistryDmarcInternalReport.js"
import {
  type DmarcInternalReportGetOptions,
  dmarcInternalReportGetOptionsSchema,
} from "./dmarcInternalReportGetOptionsSchema.js"

/**
 * `x:DmarcInternalReport/get` — fetch outbound DMARC aggregate reports pending delivery.
 * Internal reports cannot be created ("Reports cannot be created"); update only
 * accepts a future `deliverAt` to reschedule delivery
 * (`crates/jmap/src/registry/mapping/report.rs:36-37,42-102`).
 */
export async function dmarcInternalReportGet(
  options: DmarcInternalReportGetOptions,
): PromiseResult<JmapGetResponse<RegistryDmarcInternalReport>> {
  const op = "dmarcInternalReportGet"
  const parsed = a.safeParse(dmarcInternalReportGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryGet({ config, objectType: "DmarcInternalReport", ...args })
}
