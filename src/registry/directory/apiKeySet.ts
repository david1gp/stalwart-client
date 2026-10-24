import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type ApiKeySetOptions, apiKeySetOptionsSchema } from "./apiKeySetOptionsSchema.js"

/**
 * `x:ApiKey/set` — create, update and/or destroy directory ApiKey entries.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry makes the call a ResultErr.
 */
export async function apiKeySet(options: ApiKeySetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "apiKeySet"
  const parsed = a.safeParse(apiKeySetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registrySet({ config, objectType: "ApiKey" as const, ...rest })
}
