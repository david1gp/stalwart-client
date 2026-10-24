import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import {
  dkimReportSettingsSetOptionsSchema,
  type DkimReportSettingsSetOptions,
} from "./dkimReportSettingsSetOptionsSchema.js"

/**
 * `x:DkimReportSettings/set` — Configures DKIM authentication failure report generation.
 */
export async function dkimReportSettingsSet(
  options: DkimReportSettingsSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "dkimReportSettingsSet"
  const parsed = a.safeParse(dkimReportSettingsSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "DkimReportSettings" })
}
