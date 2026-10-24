import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type TracingStoreSetOptions, tracingStoreSetOptionsSchema } from "./tracingStoreSetOptionsSchema.js"

/**
 * `x:TracingStore/set` — update the tracing storage backend singleton
 * (under the `"singleton"` id). Dangerous: repointing the store breaks the
 * server — mock-tested only, never run against a live instance.
 */
export async function tracingStoreSet(
  options: TracingStoreSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "tracingStoreSet"
  const parsed = a.safeParse(tracingStoreSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  const response = await registrySet({ config, objectType: "TracingStore", ...args })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
