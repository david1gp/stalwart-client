import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapQueryChangesResponse } from "../jmap/jmapQueryChangesResponse.js"
import { quotaAccountIdResolve } from "./quotaAccountIdResolve.js"
import { quotaQueryChangesOptionsSchema, type QuotaQueryChangesOptions } from "./quotaQueryChangesOptionsSchema.js"

/**
 * `Quota/queryChanges` — poll query-result changes. Note: the community
 * server rejects this method with `cannotCalculateChanges`
 * (`crates/jmap/src/changes/query.rs:265-267`); the call surfaces that as a
 * ResultErr.
 */
export async function quotaQueryChanges(options: QuotaQueryChangesOptions): PromiseResult<JmapQueryChangesResponse> {
  const op = "quotaQueryChanges"
  const parsed = a.safeParse(quotaQueryChangesOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await quotaAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapQueryChangesResponse>({
    config: parsed.output.config,
    session: resolved.data.session,
    methodName: "Quota/queryChanges",
    arguments: bodyOmitUndefined({
      accountId: resolved.data.accountId,
      sinceQueryState: parsed.output.sinceQueryState,
      filter: parsed.output.filter,
      sort: parsed.output.sort,
      maxChanges: parsed.output.maxChanges,
      calculateTotal: parsed.output.calculateTotal,
    }),
  })
}
