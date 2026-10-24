import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistryDkimReportSettings } from "../generated/RegistryDkimReportSettings.js"
import {
  dkimReportSettingsGetOptionsSchema,
  type DkimReportSettingsGetOptions,
} from "./dkimReportSettingsGetOptionsSchema.js"

/**
 * `x:DkimReportSettings/get` — Configures DKIM authentication failure report generation.
 */
export async function dkimReportSettingsGet(
  options: DkimReportSettingsGetOptions,
): PromiseResult<JmapGetResponse<RegistryDkimReportSettings>> {
  const op = "dkimReportSettingsGet"
  const parsed = a.safeParse(dkimReportSettingsGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "DkimReportSettings" })
}
