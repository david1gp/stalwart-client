import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { spamRuleQueryOptionsSchema, type SpamRuleQueryOptions } from "./spamRuleQueryOptionsSchema.js"

/**
 * `x:SpamRule/query` — Defines a spam filter rule for message classification.
 */
export async function spamRuleQuery(options: SpamRuleQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "spamRuleQuery"
  const parsed = a.safeParse(spamRuleQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "SpamRule" })
}
