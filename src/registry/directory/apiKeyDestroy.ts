import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type ApiKeyDestroyOptions, apiKeyDestroyOptionsSchema } from "./apiKeyDestroyOptionsSchema.js"

/**
 * `x:ApiKey/set` destroy — destroy one directory ApiKey entry by id.
 */
export async function apiKeyDestroy(options: ApiKeyDestroyOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "apiKeyDestroy"
  const parsed = a.safeParse(apiKeyDestroyOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({
    config: parsed.output.config,
    objectType: "ApiKey" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    destroy: [parsed.output.id],
  })
}
