import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import {
  spfReportSettingsSetOptionsSchema,
  type SpfReportSettingsSetOptions,
} from "./spfReportSettingsSetOptionsSchema.js"

/**
 * `x:SpfReportSettings/set` — Configures SPF authentication failure report generation.
 */
export async function spfReportSettingsSet(
  options: SpfReportSettingsSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "spfReportSettingsSet"
  const parsed = a.safeParse(spfReportSettingsSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "SpfReportSettings" })
}
