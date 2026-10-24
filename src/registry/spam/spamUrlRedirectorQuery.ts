import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import {
  spamUrlRedirectorQueryOptionsSchema,
  type SpamUrlRedirectorQueryOptions,
} from "./spamUrlRedirectorQueryOptionsSchema.js"

/**
 * `URL redirector domains` — `x:MemoryLookupKey/query` pre-filtered to namespace `url-redirectors`
 * (`resources/schema/schema.json.gz` `x:MemoryLookupKey/SpamUrlRedirector` `filtersStatic`).
 */
export async function spamUrlRedirectorQuery(options: SpamUrlRedirectorQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "spamUrlRedirectorQuery"
  const parsed = a.safeParse(spamUrlRedirectorQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, filter, ...rest } = parsed.output
  return registryQuery({
    config,
    ...rest,
    objectType: "MemoryLookupKey",
    filter: { ...filter, namespace: "url-redirectors" },
  })
}
