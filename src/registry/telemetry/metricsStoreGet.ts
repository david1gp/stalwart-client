import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistryMetricsStore } from "../generated/RegistryMetricsStore.js"
import { type MetricsStoreGetOptions, metricsStoreGetOptionsSchema } from "./metricsStoreGetOptionsSchema.js"

/**
 * `x:MetricsStore/get` — fetch the metrics storage backend singleton
 * (`Disabled`, `Default`, `FoundationDb`, `PostgreSql` or `MySql`).
 * Read-only in practice: repointing the store breaks the server.
 */
export async function metricsStoreGet(
  options: MetricsStoreGetOptions,
): PromiseResult<JmapGetResponse<RegistryMetricsStore>> {
  const op = "metricsStoreGet"
  const parsed = a.safeParse(metricsStoreGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryGet({ config, objectType: "MetricsStore", ...args })
}
