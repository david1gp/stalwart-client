import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistrySpfReportSettings } from "../generated/RegistrySpfReportSettings.js"
import {
  spfReportSettingsGetOptionsSchema,
  type SpfReportSettingsGetOptions,
} from "./spfReportSettingsGetOptionsSchema.js"

/**
 * `x:SpfReportSettings/get` — Configures SPF authentication failure report generation.
 */
export async function spfReportSettingsGet(
  options: SpfReportSettingsGetOptions,
): PromiseResult<JmapGetResponse<RegistrySpfReportSettings>> {
  const op = "spfReportSettingsGet"
  const parsed = a.safeParse(spfReportSettingsGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "SpfReportSettings" })
}
