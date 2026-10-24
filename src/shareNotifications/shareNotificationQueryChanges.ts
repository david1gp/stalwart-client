import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapQueryChangesResponse } from "../jmap/jmapQueryChangesResponse.js"
import { shareNotificationAccountIdResolve } from "./shareNotificationAccountIdResolve.js"
import {
  shareNotificationQueryChangesOptionsSchema,
  type ShareNotificationQueryChangesOptions,
} from "./shareNotificationQueryChangesOptionsSchema.js"

/**
 * `ShareNotification/queryChanges` — poll query-result changes since
 * `sinceQueryState` (usually the `queryState` from a `ShareNotification/query`).
 */
export async function shareNotificationQueryChanges(
  options: ShareNotificationQueryChangesOptions,
): PromiseResult<JmapQueryChangesResponse> {
  const op = "shareNotificationQueryChanges"
  const parsed = a.safeParse(shareNotificationQueryChangesOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await shareNotificationAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapQueryChangesResponse>({
    config: parsed.output.config,
    session: resolved.data.session,
    methodName: "ShareNotification/queryChanges",
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
