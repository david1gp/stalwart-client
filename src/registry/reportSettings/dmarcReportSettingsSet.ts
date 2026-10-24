import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import {
  dmarcReportSettingsSetOptionsSchema,
  type DmarcReportSettingsSetOptions,
} from "./dmarcReportSettingsSetOptionsSchema.js"

/**
 * `x:DmarcReportSettings/set` — Configures DMARC aggregate and failure report generation.
 */
export async function dmarcReportSettingsSet(
  options: DmarcReportSettingsSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "dmarcReportSettingsSet"
  const parsed = a.safeParse(dmarcReportSettingsSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "DmarcReportSettings" })
}
