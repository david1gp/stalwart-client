import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { type ApiKeyQueryOptions, apiKeyQueryOptionsSchema } from "./apiKeyQueryOptionsSchema.js"

/**
 * `x:ApiKey/query` — list directory ApiKey ids with an optional filter/sort/page.
 */
export async function apiKeyQuery(options: ApiKeyQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "apiKeyQuery"
  const parsed = a.safeParse(apiKeyQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registryQuery({ config, objectType: "ApiKey" as const, ...rest })
}
