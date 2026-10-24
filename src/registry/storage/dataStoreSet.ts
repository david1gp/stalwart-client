import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type DataStoreSetOptions, dataStoreSetOptionsSchema } from "./dataStoreSetOptionsSchema.js"

/**
 * `x:DataStore/set` — update the primary data store backend singleton
 * (under the `"singleton"` id). Dangerous: repointing the store breaks the
 * server — mock-tested only, never run against a live instance.
 */
export async function dataStoreSet(options: DataStoreSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "dataStoreSet"
  const parsed = a.safeParse(dataStoreSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  const response = await registrySet({ config, objectType: "DataStore", ...args })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
