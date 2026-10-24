import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { storeLookupSetOptionsSchema, type StoreLookupSetOptions } from "./storeLookupSetOptionsSchema.js"

/**
 * `x:StoreLookup/set` — Defines an external store used for lookups.
 */
export async function storeLookupSet(options: StoreLookupSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "storeLookupSet"
  const parsed = a.safeParse(storeLookupSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "StoreLookup" })
}
