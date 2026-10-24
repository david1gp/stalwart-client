import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type DirectoryUpdateOptions, directoryUpdateOptionsSchema } from "./directoryUpdateOptionsSchema.js"

/**
 * `x:Directory/set` update — update one directory Directory entry by id.
 */
export async function directoryUpdate(
  options: DirectoryUpdateOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "directoryUpdate"
  const parsed = a.safeParse(directoryUpdateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({
    config: parsed.output.config,
    objectType: "Directory" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    update: { [parsed.output.id]: parsed.output.patch },
  })
}
