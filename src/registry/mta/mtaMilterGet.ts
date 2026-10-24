import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryObjectMap } from "../generated/RegistryObjectMap.js"
import { registryGet } from "../registryGet.js"
import { mtaMilterGetOptionsSchema, type MtaMilterGetOptions } from "./mtaMilterGetOptionsSchema.js"

/**
 * `x:MtaMilter/get` — fetch Milter filter endpoint for message processing by id (all of them when `ids` is omitted).
 */
export async function mtaMilterGet(
  options: MtaMilterGetOptions,
): PromiseResult<JmapGetResponse<RegistryObjectMap["MtaMilter"]>> {
  const op = "mtaMilterGet"
  const parsed = a.safeParse(mtaMilterGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "MtaMilter" })
}
