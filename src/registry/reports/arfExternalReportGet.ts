import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistryArfExternalReport } from "../generated/RegistryArfExternalReport.js"
import {
  type ArfExternalReportGetOptions,
  arfExternalReportGetOptionsSchema,
} from "./arfExternalReportGetOptionsSchema.js"

/**
 * `x:ArfExternalReport/get` — fetch stored ARF feedback reports by id.
 * Reports are read-only apart from destroy: create always fails with
 * "Reports cannot be created" and update always fails with
 * "External reports cannot be updated"
 * (`crates/jmap/src/registry/mapping/report.rs:36-37,109-110`).
 */
export async function arfExternalReportGet(
  options: ArfExternalReportGetOptions,
): PromiseResult<JmapGetResponse<RegistryArfExternalReport>> {
  const op = "arfExternalReportGet"
  const parsed = a.safeParse(arfExternalReportGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryGet({ config, objectType: "ArfExternalReport", ...args })
}
