import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistryReportSettings } from "../generated/RegistryReportSettings.js"
import { reportSettingsGetOptionsSchema, type ReportSettingsGetOptions } from "./reportSettingsGetOptionsSchema.js"

/**
 * `x:ReportSettings/get` — Configures inbound report analysis and outbound report settings.
 */
export async function reportSettingsGet(
  options: ReportSettingsGetOptions,
): PromiseResult<JmapGetResponse<RegistryReportSettings>> {
  const op = "reportSettingsGet"
  const parsed = a.safeParse(reportSettingsGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "ReportSettings" })
}
