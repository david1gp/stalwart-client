import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type DirectoryDestroyOptions, directoryDestroyOptionsSchema } from "./directoryDestroyOptionsSchema.js"

/**
 * `x:Directory/set` destroy — destroy one directory Directory entry by id.
 */
export async function directoryDestroy(
  options: DirectoryDestroyOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "directoryDestroy"
  const parsed = a.safeParse(directoryDestroyOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({
    config: parsed.output.config,
    objectType: "Directory" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    destroy: [parsed.output.id],
  })
}
