import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryObjectMap } from "../generated/RegistryObjectMap.js"
import { registryGet } from "../registryGet.js"
import { mtaExtensionsGetOptionsSchema, type MtaExtensionsGetOptions } from "./mtaExtensionsGetOptionsSchema.js"

/**
 * `x:MtaExtensions/get` — fetch SMTP protocol extensions offered to clients by id (all of them when `ids` is omitted).
 */
export async function mtaExtensionsGet(
  options: MtaExtensionsGetOptions,
): PromiseResult<JmapGetResponse<RegistryObjectMap["MtaExtensions"]>> {
  const op = "mtaExtensionsGet"
  const parsed = a.safeParse(mtaExtensionsGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "MtaExtensions" })
}
