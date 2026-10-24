import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryApiKey } from "../generated/RegistryApiKey.js"
import { registryGet } from "../registryGet.js"
import { type ApiKeyGetOptions, apiKeyGetOptionsSchema } from "./apiKeyGetOptionsSchema.js"

/**
 * `x:ApiKey/get` — fetch directory ApiKey entries by id.
 */
export async function apiKeyGet(
  options: ApiKeyGetOptions,
): PromiseResult<JmapGetResponse<RegistryApiKey & { id: string }>> {
  const op = "apiKeyGet"
  const parsed = a.safeParse(apiKeyGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registryGet({ config, objectType: "ApiKey" as const, ...rest })
}
