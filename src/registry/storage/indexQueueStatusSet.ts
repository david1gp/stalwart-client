import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import {
  type IndexQueueStatusSetOptions,
  indexQueueStatusSetOptionsSchema,
} from "./indexQueueStatusSetOptionsSchema.js"

/**
 * `x:IndexQueueStatus/set` — update and/or destroy index queue entries
 * (queue management: retry, rebuild, drop). Any non-empty
 * `notUpdated`/`notDestroyed` entry makes the whole call a ResultErr.
 */
export async function indexQueueStatusSet(
  options: IndexQueueStatusSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "indexQueueStatusSet"
  const parsed = a.safeParse(indexQueueStatusSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  const response = await registrySet({ config, objectType: "IndexQueueStatus", ...args })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
