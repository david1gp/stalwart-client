import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistryTlsReportSettings } from "../generated/RegistryTlsReportSettings.js"
import {
  tlsReportSettingsGetOptionsSchema,
  type TlsReportSettingsGetOptions,
} from "./tlsReportSettingsGetOptionsSchema.js"

/**
 * `x:TlsReportSettings/get` — Configures TLS aggregate report generation.
 */
export async function tlsReportSettingsGet(
  options: TlsReportSettingsGetOptions,
): PromiseResult<JmapGetResponse<RegistryTlsReportSettings>> {
  const op = "tlsReportSettingsGet"
  const parsed = a.safeParse(tlsReportSettingsGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "TlsReportSettings" })
}
