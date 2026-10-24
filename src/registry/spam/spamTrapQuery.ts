import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { spamTrapQueryOptionsSchema, type SpamTrapQueryOptions } from "./spamTrapQueryOptionsSchema.js"

/**
 * `Spam trap addresses` — `x:MemoryLookupKey/query` pre-filtered to namespace `spam-traps`
 * (`resources/schema/schema.json.gz` `x:MemoryLookupKey/SpamTrap` `filtersStatic`).
 */
export async function spamTrapQuery(options: SpamTrapQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "spamTrapQuery"
  const parsed = a.safeParse(spamTrapQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, filter, ...rest } = parsed.output
  return registryQuery({
    config,
    ...rest,
    objectType: "MemoryLookupKey",
    filter: { ...filter, namespace: "spam-traps" },
  })
}
