import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type DataRetentionSetOptions, dataRetentionSetOptionsSchema } from "./dataRetentionSetOptionsSchema.js"

/**
 * `x:DataRetention/set` — update the data retention singleton
 * (under the `"singleton"` id). Reversible: read with `dataRetentionGet`,
 * patch one window, then restore. Any non-empty `notUpdated` entry makes the
 * whole call a ResultErr carrying the full SetResponse in `errorData`.
 */
export async function dataRetentionSet(
  options: DataRetentionSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "dataRetentionSet"
  const parsed = a.safeParse(dataRetentionSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  const response = await registrySet({ config, objectType: "DataRetention", ...args })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
