import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import {
  spamDnsblServerQueryOptionsSchema,
  type SpamDnsblServerQueryOptions,
} from "./spamDnsblServerQueryOptionsSchema.js"

/**
 * `x:SpamDnsblServer/query` — Defines a DNSBL server used for spam filtering lookups.
 */
export async function spamDnsblServerQuery(options: SpamDnsblServerQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "spamDnsblServerQuery"
  const parsed = a.safeParse(spamDnsblServerQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "SpamDnsblServer" })
}
