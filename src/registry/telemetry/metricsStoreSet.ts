import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type MetricsStoreSetOptions, metricsStoreSetOptionsSchema } from "./metricsStoreSetOptionsSchema.js"

/**
 * `x:MetricsStore/set` — update the metrics storage backend singleton
 * (under the `"singleton"` id). Dangerous: repointing the store breaks the
 * server — mock-tested only, never run against a live instance.
 */
export async function metricsStoreSet(
  options: MetricsStoreSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "metricsStoreSet"
  const parsed = a.safeParse(metricsStoreSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  const response = await registrySet({ config, objectType: "MetricsStore", ...args })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
