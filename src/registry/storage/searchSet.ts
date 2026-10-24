import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type SearchSetOptions, searchSetOptionsSchema } from "./searchSetOptionsSchema.js"

/**
 * `x:Search/set` — update the full-text search indexing singleton
 * (under the `"singleton"` id). Reversible: read with `searchGet`, patch,
 * then restore. Any non-empty `notUpdated` entry makes the whole call a
 * ResultErr carrying the full SetResponse in `errorData`.
 */
export async function searchSet(options: SearchSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "searchSet"
  const parsed = a.safeParse(searchSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  const response = await registrySet({ config, objectType: "Search", ...args })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
