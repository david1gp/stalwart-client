import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapChangesResponse } from "../jmap/jmapChangesResponse.js"
import { quotaAccountIdResolve } from "./quotaAccountIdResolve.js"
import { quotaChangesOptionsSchema, type QuotaChangesOptions } from "./quotaChangesOptionsSchema.js"

/**
 * `Quota/changes` — poll quota changes since `sinceState` (usually the
 * `state` from a previous `Quota/get`).
 */
export async function quotaChanges(options: QuotaChangesOptions): PromiseResult<JmapChangesResponse> {
  const op = "quotaChanges"
  const parsed = a.safeParse(quotaChangesOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await quotaAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapChangesResponse>({
    config: parsed.output.config,
    session: resolved.data.session,
    methodName: "Quota/changes",
    arguments: bodyOmitUndefined({
      accountId: resolved.data.accountId,
      sinceState: parsed.output.sinceState,
      maxChanges: parsed.output.maxChanges,
    }),
  })
}
