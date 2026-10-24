import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import {
  tlsReportSettingsSetOptionsSchema,
  type TlsReportSettingsSetOptions,
} from "./tlsReportSettingsSetOptionsSchema.js"

/**
 * `x:TlsReportSettings/set` — Configures TLS aggregate report generation.
 */
export async function tlsReportSettingsSet(
  options: TlsReportSettingsSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "tlsReportSettingsSet"
  const parsed = a.safeParse(tlsReportSettingsSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "TlsReportSettings" })
}
