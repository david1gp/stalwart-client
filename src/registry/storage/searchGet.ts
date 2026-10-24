import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistrySearch } from "../generated/RegistrySearch.js"
import { type SearchGetOptions, searchGetOptionsSchema } from "./searchGetOptionsSchema.js"

/**
 * `x:Search/get` — fetch the full-text search indexing singleton (which
 * datasets and fields are indexed).
 */
export async function searchGet(options: SearchGetOptions): PromiseResult<JmapGetResponse<RegistrySearch>> {
  const op = "searchGet"
  const parsed = a.safeParse(searchGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryGet({ config, objectType: "Search", ...args })
}
