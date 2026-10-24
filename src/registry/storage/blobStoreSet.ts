import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type BlobStoreSetOptions, blobStoreSetOptionsSchema } from "./blobStoreSetOptionsSchema.js"

/**
 * `x:BlobStore/set` — update the blob storage backend singleton
 * (under the `"singleton"` id). Dangerous: repointing the store breaks the
 * server — mock-tested only, never run against a live instance.
 */
export async function blobStoreSet(options: BlobStoreSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "blobStoreSet"
  const parsed = a.safeParse(blobStoreSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  const response = await registrySet({ config, objectType: "BlobStore", ...args })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
