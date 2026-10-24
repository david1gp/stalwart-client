import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { spamTagQueryOptionsSchema, type SpamTagQueryOptions } from "./spamTagQueryOptionsSchema.js"

/**
 * `x:SpamTag/query` — Defines a score or action assigned to a spam classification tag.
 */
export async function spamTagQuery(options: SpamTagQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "spamTagQuery"
  const parsed = a.safeParse(spamTagQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "SpamTag" })
}
