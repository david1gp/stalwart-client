import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistrySearchStore } from "../generated/RegistrySearchStore.js"
import { type SearchStoreGetOptions, searchStoreGetOptionsSchema } from "./searchStoreGetOptionsSchema.js"

/**
 * `x:SearchStore/get` — fetch the full-text search backend singleton
 * (`Default`, `ElasticSearch`, `Meilisearch`, `FoundationDb`, `PostgreSql`
 * or `MySql`). Read-only in practice: repointing the store breaks the server.
 */
export async function searchStoreGet(
  options: SearchStoreGetOptions,
): PromiseResult<JmapGetResponse<RegistrySearchStore>> {
  const op = "searchStoreGet"
  const parsed = a.safeParse(searchStoreGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryGet({ config, objectType: "SearchStore", ...args })
}
