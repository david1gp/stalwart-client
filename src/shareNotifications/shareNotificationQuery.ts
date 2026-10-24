import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapQueryResponse } from "../jmap/jmapQueryResponse.js"
import { shareNotificationAccountIdResolve } from "./shareNotificationAccountIdResolve.js"
import {
  shareNotificationQueryOptionsSchema,
  type ShareNotificationQueryOptions,
} from "./shareNotificationQueryOptionsSchema.js"

/** `ShareNotification/query` — list share notification ids. */
export async function shareNotificationQuery(options: ShareNotificationQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "shareNotificationQuery"
  const parsed = a.safeParse(shareNotificationQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await shareNotificationAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapQueryResponse>({
    config: parsed.output.config,
    session: resolved.data.session,
    methodName: "ShareNotification/query",
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
