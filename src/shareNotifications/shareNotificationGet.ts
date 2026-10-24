import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapGetResponse } from "../jmap/jmapGetResponse.js"
import { shareNotificationAccountIdResolve } from "./shareNotificationAccountIdResolve.js"
import {
  shareNotificationGetOptionsSchema,
  type ShareNotificationGetOptions,
} from "./shareNotificationGetOptionsSchema.js"
import type { ShareNotification } from "./ShareNotification.js"

/** `ShareNotification/get` — fetch share notifications by id. */
export async function shareNotificationGet(
  options: ShareNotificationGetOptions,
): PromiseResult<JmapGetResponse<ShareNotification>> {
  const op = "shareNotificationGet"
  const parsed = a.safeParse(shareNotificationGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await shareNotificationAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapGetResponse<ShareNotification>>({
    config: parsed.output.config,
    session: resolved.data.session,
    methodName: "ShareNotification/get",
    arguments: bodyOmitUndefined({
      accountId: resolved.data.accountId,
      ids: parsed.output.ids,
      properties: parsed.output.properties,
    }),
  })
}
