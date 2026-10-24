import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryObjectMap } from "../generated/RegistryObjectMap.js"
import { registryGet } from "../registryGet.js"
import { queuedMessageGetOptionsSchema, type QueuedMessageGetOptions } from "./queuedMessageGetOptionsSchema.js"

/**
 * `x:QueuedMessage/get` — fetch queued email message pending delivery by id (all of them when `ids` is omitted).
 */
export async function queuedMessageGet(
  options: QueuedMessageGetOptions,
): PromiseResult<JmapGetResponse<RegistryObjectMap["QueuedMessage"]>> {
  const op = "queuedMessageGet"
  const parsed = a.safeParse(queuedMessageGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "QueuedMessage" })
}
