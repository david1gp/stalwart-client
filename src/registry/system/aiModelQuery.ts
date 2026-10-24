import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { aiModelQueryOptionsSchema, type AiModelQueryOptions } from "./aiModelQueryOptionsSchema.js"

/**
 * `x:AiModel/query` — list AI model endpoint ids with an optional
 * flat AND filter.
 */
export async function aiModelQuery(options: AiModelQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "aiModelQuery"
  const parsed = a.safeParse(aiModelQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "AiModel" })
}
