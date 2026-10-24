import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type ApiKeyUpdateOptions, apiKeyUpdateOptionsSchema } from "./apiKeyUpdateOptionsSchema.js"

/**
 * `x:ApiKey/set` update — update one directory ApiKey entry by id.
 */
export async function apiKeyUpdate(options: ApiKeyUpdateOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "apiKeyUpdate"
  const parsed = a.safeParse(apiKeyUpdateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({
    config: parsed.output.config,
    objectType: "ApiKey" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    update: { [parsed.output.id]: parsed.output.patch },
  })
}
