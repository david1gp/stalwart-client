import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistryIndexQueueStatus } from "../generated/RegistryIndexQueueStatus.js"
import {
  type IndexQueueStatusGetOptions,
  indexQueueStatusGetOptionsSchema,
} from "./indexQueueStatusGetOptionsSchema.js"

/**
 * `x:IndexQueueStatus/get` — fetch search index queue states by id
 * (per-index, per-partition queued updates/deletions and status).
 */
export async function indexQueueStatusGet(
  options: IndexQueueStatusGetOptions,
): PromiseResult<JmapGetResponse<RegistryIndexQueueStatus>> {
  const op = "indexQueueStatusGet"
  const parsed = a.safeParse(indexQueueStatusGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryGet({ config, objectType: "IndexQueueStatus", ...args })
}
