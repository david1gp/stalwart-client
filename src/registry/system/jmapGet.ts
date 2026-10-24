import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryJmap } from "../generated/RegistryJmap.js"
import { registryGet } from "../registryGet.js"
import { jmapGetOptionsSchema, type JmapGetOptions } from "./jmapGetOptionsSchema.js"

/**
 * `x:Jmap/get` — read the JMAP protocol limits singleton
 * (request/upload/push limits). Named `jmapGet` after the inventory helper;
 * it does not collide with the generic `jmap*` core functions.
 */
export async function jmapGet(options: JmapGetOptions): PromiseResult<JmapGetResponse<RegistryJmap & { id: string }>> {
  const op = "jmapGet"
  const parsed = a.safeParse(jmapGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "Jmap" })
}
