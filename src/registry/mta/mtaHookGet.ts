import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryObjectMap } from "../generated/RegistryObjectMap.js"
import { registryGet } from "../registryGet.js"
import { mtaHookGetOptionsSchema, type MtaHookGetOptions } from "./mtaHookGetOptionsSchema.js"

/**
 * `x:MtaHook/get` — fetch MTA hook endpoint for message processing by id (all of them when `ids` is omitted).
 */
export async function mtaHookGet(
  options: MtaHookGetOptions,
): PromiseResult<JmapGetResponse<RegistryObjectMap["MtaHook"]>> {
  const op = "mtaHookGet"
  const parsed = a.safeParse(mtaHookGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "MtaHook" })
}
