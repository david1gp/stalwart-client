import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistryStoreLookup } from "../generated/RegistryStoreLookup.js"
import { storeLookupGetOptionsSchema, type StoreLookupGetOptions } from "./storeLookupGetOptionsSchema.js"

/**
 * `x:StoreLookup/get` — Defines an external store used for lookups.
 */
export async function storeLookupGet(
  options: StoreLookupGetOptions,
): PromiseResult<JmapGetResponse<RegistryStoreLookup>> {
  const op = "storeLookupGet"
  const parsed = a.safeParse(storeLookupGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "StoreLookup" })
}
