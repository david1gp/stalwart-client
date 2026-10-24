import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistryEventTracingLevel } from "../generated/RegistryEventTracingLevel.js"
import {
  type EventTracingLevelGetOptions,
  eventTracingLevelGetOptionsSchema,
} from "./eventTracingLevelGetOptionsSchema.js"

/**
 * `x:EventTracingLevel/get` — fetch per-event logging level overrides by id.
 * Each entry maps one event type to a tracing level override.
 */
export async function eventTracingLevelGet(
  options: EventTracingLevelGetOptions,
): PromiseResult<JmapGetResponse<RegistryEventTracingLevel>> {
  const op = "eventTracingLevelGet"
  const parsed = a.safeParse(eventTracingLevelGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryGet({ config, objectType: "EventTracingLevel", ...args })
}
