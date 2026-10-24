import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import {
  type EventTracingLevelSetOptions,
  eventTracingLevelSetOptionsSchema,
} from "./eventTracingLevelSetOptionsSchema.js"

/**
 * `x:EventTracingLevel/set` — create, update and/or destroy per-event logging
 * level overrides. Any non-empty `notCreated`/`notUpdated`/`notDestroyed`
 * entry makes the whole call a ResultErr carrying the full SetResponse in
 * `errorData`.
 */
export async function eventTracingLevelSet(
  options: EventTracingLevelSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "eventTracingLevelSet"
  const parsed = a.safeParse(eventTracingLevelSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  const response = await registrySet({ config, objectType: "EventTracingLevel", ...args })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
