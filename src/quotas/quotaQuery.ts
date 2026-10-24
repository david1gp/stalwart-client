import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapQueryResponse } from "../jmap/jmapQueryResponse.js"
import { quotaAccountIdResolve } from "./quotaAccountIdResolve.js"
import { quotaQueryOptionsSchema, type QuotaQueryOptions } from "./quotaQueryOptionsSchema.js"

/** `Quota/query` — list quota ids. */
export async function quotaQuery(options: QuotaQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "quotaQuery"
  const parsed = a.safeParse(quotaQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await quotaAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapQueryResponse>({
    config: parsed.output.config,
    session: resolved.data.session,
    methodName: "Quota/query",
    arguments: bodyOmitUndefined({
      accountId: resolved.data.accountId,
      filter: parsed.output.filter,
      sort: parsed.output.sort,
      position: parsed.output.position,
      limit: parsed.output.limit,
      calculateTotal: parsed.output.calculateTotal,
    }),
  })
}
