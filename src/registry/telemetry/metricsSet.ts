import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type MetricsSetOptions, metricsSetOptionsSchema } from "./metricsSetOptionsSchema.js"

/**
 * `x:Metrics/set` — update the metrics collection singleton
 * (under the `"singleton"` id). Reversible: read with `metricsGet`, patch,
 * then restore. Any non-empty `notUpdated` entry makes the whole call a
 * ResultErr carrying the full SetResponse in `errorData`.
 */
export async function metricsSet(options: MetricsSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "metricsSet"
  const parsed = a.safeParse(metricsSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  const response = await registrySet({ config, objectType: "Metrics", ...args })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
