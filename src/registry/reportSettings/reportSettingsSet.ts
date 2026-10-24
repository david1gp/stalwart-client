import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { reportSettingsSetOptionsSchema, type ReportSettingsSetOptions } from "./reportSettingsSetOptionsSchema.js"

/**
 * `x:ReportSettings/set` — Configures inbound report analysis and outbound report settings.
 */
export async function reportSettingsSet(
  options: ReportSettingsSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "reportSettingsSet"
  const parsed = a.safeParse(reportSettingsSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "ReportSettings" })
}
