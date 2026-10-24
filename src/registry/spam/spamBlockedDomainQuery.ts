import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import {
  spamBlockedDomainQueryOptionsSchema,
  type SpamBlockedDomainQueryOptions,
} from "./spamBlockedDomainQueryOptionsSchema.js"

/**
 * `Blocked domain names` — `x:MemoryLookupKey/query` pre-filtered to namespace `blocked-domains`
 * (`resources/schema/schema.json.gz` `x:MemoryLookupKey/SpamBlockedDomain` `filtersStatic`).
 */
export async function spamBlockedDomainQuery(options: SpamBlockedDomainQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "spamBlockedDomainQuery"
  const parsed = a.safeParse(spamBlockedDomainQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, filter, ...rest } = parsed.output
  return registryQuery({
    config,
    ...rest,
    objectType: "MemoryLookupKey",
    filter: { ...filter, namespace: "blocked-domains" },
  })
}
