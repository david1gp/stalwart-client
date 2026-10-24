import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { mtaExtensionsSetOptionsSchema, type MtaExtensionsSetOptions } from "./mtaExtensionsSetOptionsSchema.js"

/**
 * `x:MtaExtensions/set` — create, update and/or destroy SMTP protocol extensions offered to clients.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry becomes a ResultErr.
 */
export async function mtaExtensionsSet(
  options: MtaExtensionsSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "mtaExtensionsSet"
  const parsed = a.safeParse(mtaExtensionsSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "MtaExtensions" })
}
