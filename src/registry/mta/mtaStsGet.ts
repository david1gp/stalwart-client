import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryObjectMap } from "../generated/RegistryObjectMap.js"
import { registryGet } from "../registryGet.js"
import { mtaStsGetOptionsSchema, type MtaStsGetOptions } from "./mtaStsGetOptionsSchema.js"

/**
 * `x:MtaSts/get` — fetch MTA-STS policy for the server by id (all of them when `ids` is omitted).
 */
export async function mtaStsGet(
  options: MtaStsGetOptions,
): PromiseResult<JmapGetResponse<RegistryObjectMap["MtaSts"]>> {
  const op = "mtaStsGet"
  const parsed = a.safeParse(mtaStsGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "MtaSts" })
}
