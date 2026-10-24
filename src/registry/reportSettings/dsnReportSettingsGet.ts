import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistryDsnReportSettings } from "../generated/RegistryDsnReportSettings.js"
import {
  dsnReportSettingsGetOptionsSchema,
  type DsnReportSettingsGetOptions,
} from "./dsnReportSettingsGetOptionsSchema.js"

/**
 * `x:DsnReportSettings/get` — Configures Delivery Status Notification (DSN) report generation.
 */
export async function dsnReportSettingsGet(
  options: DsnReportSettingsGetOptions,
): PromiseResult<JmapGetResponse<RegistryDsnReportSettings>> {
  const op = "dsnReportSettingsGet"
  const parsed = a.safeParse(dsnReportSettingsGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "DsnReportSettings" })
}
