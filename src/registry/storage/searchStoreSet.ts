import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type SearchStoreSetOptions, searchStoreSetOptionsSchema } from "./searchStoreSetOptionsSchema.js"

/**
 * `x:SearchStore/set` — update the full-text search backend singleton
 * (under the `"singleton"` id). Dangerous: repointing the store breaks the
 * server — mock-tested only, never run against a live instance.
 */
export async function searchStoreSet(options: SearchStoreSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "searchStoreSet"
  const parsed = a.safeParse(searchStoreSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  const response = await registrySet({ config, objectType: "SearchStore", ...args })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
