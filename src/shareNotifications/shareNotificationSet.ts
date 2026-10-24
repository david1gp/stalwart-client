import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { jmapSetErrorCheck } from "../jmap/jmapSetErrorCheck.js"
import type { JmapSetResponse } from "../jmap/jmapSetResponse.js"
import { shareNotificationAccountIdResolve } from "./shareNotificationAccountIdResolve.js"
import {
  shareNotificationSetOptionsSchema,
  type ShareNotificationSetOptions,
} from "./shareNotificationSetOptionsSchema.js"
import type { ShareNotification } from "./ShareNotification.js"

/**
 * `ShareNotification/set` — in practice only `destroy` (acknowledge a share).
 * Create/update always fail with `forbidden: "Cannot create/update share
 * notifications."` (`crates/jmap/src/share_notification/set.rs`) and surface
 * as a ResultErr via `jmapSetErrorCheck`.
 */
export async function shareNotificationSet(
  options: ShareNotificationSetOptions,
): PromiseResult<JmapSetResponse<ShareNotification>> {
  const op = "shareNotificationSet"
  const parsed = a.safeParse(shareNotificationSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await shareNotificationAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  const response = await stalwartMethodCall<JmapSetResponse<ShareNotification>>({
    config: parsed.output.config,
    session: resolved.data.session,
    methodName: "ShareNotification/set",
    arguments: bodyOmitUndefined({
      accountId: resolved.data.accountId,
      create: parsed.output.create,
      update: parsed.output.update,
      destroy: parsed.output.destroy,
    }),
  })
  if (!response.success) return response
  return jmapSetErrorCheck(op, response.data)
}
