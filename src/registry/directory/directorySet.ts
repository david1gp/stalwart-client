import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type DirectorySetOptions, directorySetOptionsSchema } from "./directorySetOptionsSchema.js"

/**
 * `x:Directory/set` — create, update and/or destroy directory Directory entries.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry makes the call a ResultErr.
 */
export async function directorySet(options: DirectorySetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "directorySet"
  const parsed = a.safeParse(directorySetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registrySet({ config, objectType: "Directory" as const, ...rest })
}
