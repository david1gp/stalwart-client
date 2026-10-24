import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type ArchivedItemSetOptions, archivedItemSetOptionsSchema } from "./archivedItemSetOptionsSchema.js"

/**
 * `x:ArchivedItem/set` — update (restore flow: `status`, `archivedUntil`)
 * and/or destroy archived items. Enterprise-only on the community edition.
 * Create always fails; any non-empty `notUpdated`/`notDestroyed` entry makes
 * the whole call a ResultErr carrying the full SetResponse in `errorData`.
 */
export async function archivedItemSet(
  options: ArchivedItemSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "archivedItemSet"
  const parsed = a.safeParse(archivedItemSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  const response = await registrySet({ config, objectType: "ArchivedItem", ...args })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
