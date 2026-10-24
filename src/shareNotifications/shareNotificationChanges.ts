import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapChangesResponse } from "../jmap/jmapChangesResponse.js"
import { shareNotificationAccountIdResolve } from "./shareNotificationAccountIdResolve.js"
import {
  shareNotificationChangesOptionsSchema,
  type ShareNotificationChangesOptions,
} from "./shareNotificationChangesOptionsSchema.js"

/**
 * `ShareNotification/changes` — poll share notification changes since
 * `sinceState` (usually the `state` from a previous `ShareNotification/get`).
 */
export async function shareNotificationChanges(
  options: ShareNotificationChangesOptions,
): PromiseResult<JmapChangesResponse> {
  const op = "shareNotificationChanges"
  const parsed = a.safeParse(shareNotificationChangesOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await shareNotificationAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapChangesResponse>({
    config: parsed.output.config,
    session: resolved.data.session,
    methodName: "ShareNotification/changes",
    arguments: bodyOmitUndefined({
      accountId: resolved.data.accountId,
      sinceState: parsed.output.sinceState,
      maxChanges: parsed.output.maxChanges,
    }),
  })
}
