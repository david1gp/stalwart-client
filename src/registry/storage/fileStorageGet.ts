import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistryFileStorage } from "../generated/RegistryFileStorage.js"
import { type FileStorageGetOptions, fileStorageGetOptionsSchema } from "./fileStorageGetOptionsSchema.js"

/**
 * `x:FileStorage/get` — fetch the file storage limits singleton (`maxSize`,
 * `maxFiles`, `maxFolders`).
 */
export async function fileStorageGet(
  options: FileStorageGetOptions,
): PromiseResult<JmapGetResponse<RegistryFileStorage>> {
  const op = "fileStorageGet"
  const parsed = a.safeParse(fileStorageGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryGet({ config, objectType: "FileStorage", ...args })
}
