import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistryBlobStore } from "../generated/RegistryBlobStore.js"
import { type BlobStoreGetOptions, blobStoreGetOptionsSchema } from "./blobStoreGetOptionsSchema.js"

/**
 * `x:BlobStore/get` — fetch the blob storage backend singleton (`Default`,
 * `Sharded`, `S3`, `Azure`, `FileSystem`, `FoundationDb`, `PostgreSql` or
 * `MySql`). Read-only in practice: repointing the store breaks the server.
 */
export async function blobStoreGet(options: BlobStoreGetOptions): PromiseResult<JmapGetResponse<RegistryBlobStore>> {
  const op = "blobStoreGet"
  const parsed = a.safeParse(blobStoreGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryGet({ config, objectType: "BlobStore", ...args })
}
