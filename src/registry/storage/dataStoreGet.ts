import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistryDataStore } from "../generated/RegistryDataStore.js"
import { type DataStoreGetOptions, dataStoreGetOptionsSchema } from "./dataStoreGetOptionsSchema.js"

/**
 * `x:DataStore/get` — fetch the primary data store backend singleton
 * (`RocksDb`, `Sqlite`, `FoundationDb`, `PostgreSql` or `MySql`).
 * Read-only in practice: repointing the store breaks the server.
 */
export async function dataStoreGet(options: DataStoreGetOptions): PromiseResult<JmapGetResponse<RegistryDataStore>> {
  const op = "dataStoreGet"
  const parsed = a.safeParse(dataStoreGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryGet({ config, objectType: "DataStore", ...args })
}
