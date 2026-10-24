import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import {
  dsnReportSettingsSetOptionsSchema,
  type DsnReportSettingsSetOptions,
} from "./dsnReportSettingsSetOptionsSchema.js"

/**
 * `x:DsnReportSettings/set` — Configures Delivery Status Notification (DSN) report generation.
 */
export async function dsnReportSettingsSet(
  options: DsnReportSettingsSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "dsnReportSettingsSet"
  const parsed = a.safeParse(dsnReportSettingsSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "DsnReportSettings" })
}
