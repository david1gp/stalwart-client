import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistryDmarcReportSettings } from "../generated/RegistryDmarcReportSettings.js"
import {
  dmarcReportSettingsGetOptionsSchema,
  type DmarcReportSettingsGetOptions,
} from "./dmarcReportSettingsGetOptionsSchema.js"

/**
 * `x:DmarcReportSettings/get` — Configures DMARC aggregate and failure report generation.
 */
export async function dmarcReportSettingsGet(
  options: DmarcReportSettingsGetOptions,
): PromiseResult<JmapGetResponse<RegistryDmarcReportSettings>> {
  const op = "dmarcReportSettingsGet"
  const parsed = a.safeParse(dmarcReportSettingsGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "DmarcReportSettings" })
}
