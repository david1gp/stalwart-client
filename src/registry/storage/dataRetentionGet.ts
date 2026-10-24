import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistryDataRetention } from "../generated/RegistryDataRetention.js"
import { type DataRetentionGetOptions, dataRetentionGetOptionsSchema } from "./dataRetentionGetOptionsSchema.js"

/**
 * `x:DataRetention/get` — fetch the data retention singleton (expunge
 * schedules, retention windows and archival settings). The
 * `x:DataRetention/ArchivingRetention`, `x:DataRetention/DataCleanup`,
 * `x:DataRetention/DataExpunge` and `x:DataRetention/TelemetryRetention` views
 * ride on this object.
 */
export async function dataRetentionGet(
  options: DataRetentionGetOptions,
): PromiseResult<JmapGetResponse<RegistryDataRetention>> {
  const op = "dataRetentionGet"
  const parsed = a.safeParse(dataRetentionGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryGet({ config, objectType: "DataRetention", ...args })
}
