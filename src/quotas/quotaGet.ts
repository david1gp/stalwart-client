import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapGetResponse } from "../jmap/jmapGetResponse.js"
import { quotaAccountIdResolve } from "./quotaAccountIdResolve.js"
import { quotaGetOptionsSchema, type QuotaGetOptions } from "./quotaGetOptionsSchema.js"
import type { Quota } from "./Quota.js"

/**
 * `Quota/get` — fetch quota objects (empty list when the account has no disk
 * quota; `crates/jmap/src/quota/get.rs`).
 */
export async function quotaGet(options: QuotaGetOptions): PromiseResult<JmapGetResponse<Quota>> {
  const op = "quotaGet"
  const parsed = a.safeParse(quotaGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await quotaAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapGetResponse<Quota>>({
    config: parsed.output.config,
    session: resolved.data.session,
    methodName: "Quota/get",
    arguments: bodyOmitUndefined({
      accountId: resolved.data.accountId,
      ids: parsed.output.ids,
      properties: parsed.output.properties,
    }),
  })
}
