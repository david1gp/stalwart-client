import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistryDmarcExternalReport } from "../generated/RegistryDmarcExternalReport.js"
import {
  type DmarcExternalReportGetOptions,
  dmarcExternalReportGetOptionsSchema,
} from "./dmarcExternalReportGetOptionsSchema.js"

/**
 * `x:DmarcExternalReport/get` — fetch stored inbound DMARC aggregate reports by id.
 * Reports are read-only apart from destroy: create always fails with
 * "Reports cannot be created" and update always fails with
 * "External reports cannot be updated"
 * (`crates/jmap/src/registry/mapping/report.rs:36-37,109-110`).
 */
export async function dmarcExternalReportGet(
  options: DmarcExternalReportGetOptions,
): PromiseResult<JmapGetResponse<RegistryDmarcExternalReport>> {
  const op = "dmarcExternalReportGet"
  const parsed = a.safeParse(dmarcExternalReportGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryGet({ config, objectType: "DmarcExternalReport", ...args })
}
