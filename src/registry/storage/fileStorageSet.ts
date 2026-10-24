import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type FileStorageSetOptions, fileStorageSetOptionsSchema } from "./fileStorageSetOptionsSchema.js"

/**
 * `x:FileStorage/set` — update the file storage limits singleton
 * (under the `"singleton"` id). Reversible: read with `fileStorageGet`,
 * patch, then restore. Any non-empty `notUpdated` entry makes the whole call
 * a ResultErr carrying the full SetResponse in `errorData`.
 */
export async function fileStorageSet(options: FileStorageSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "fileStorageSet"
  const parsed = a.safeParse(fileStorageSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  const response = await registrySet({ config, objectType: "FileStorage", ...args })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
