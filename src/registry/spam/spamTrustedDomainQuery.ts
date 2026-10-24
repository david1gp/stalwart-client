import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import {
  spamTrustedDomainQueryOptionsSchema,
  type SpamTrustedDomainQueryOptions,
} from "./spamTrustedDomainQueryOptionsSchema.js"

/**
 * `Trusted domain names` — `x:MemoryLookupKey/query` pre-filtered to namespace `trusted-domains`
 * (`resources/schema/schema.json.gz` `x:MemoryLookupKey/SpamTrustedDomain` `filtersStatic`).
 */
export async function spamTrustedDomainQuery(options: SpamTrustedDomainQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "spamTrustedDomainQuery"
  const parsed = a.safeParse(spamTrustedDomainQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, filter, ...rest } = parsed.output
  return registryQuery({
    config,
    ...rest,
    objectType: "MemoryLookupKey",
    filter: { ...filter, namespace: "trusted-domains" },
  })
}
