import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type TracerSetOptions, tracerSetOptionsSchema } from "./tracerSetOptionsSchema.js"

/**
 * `x:Tracer/set` — create, update and/or destroy logging/tracing outputs.
 * Any non-empty `notCreated`/`notUpdated`/`notDestroyed` entry makes the whole
 * call a ResultErr carrying the full SetResponse in `errorData`.
 */
export async function tracerSet(options: TracerSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "tracerSet"
  const parsed = a.safeParse(tracerSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  const response = await registrySet({ config, objectType: "Tracer", ...args })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
