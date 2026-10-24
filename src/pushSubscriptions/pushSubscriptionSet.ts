import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { jmapSetErrorCheck } from "../jmap/jmapSetErrorCheck.js"
import type { JmapSetResponse } from "../jmap/jmapSetResponse.js"
import {
  pushSubscriptionSetOptionsSchema,
  type PushSubscriptionSetOptions,
} from "./pushSubscriptionSetOptionsSchema.js"
import type { PushSubscription } from "./PushSubscription.js"

/**
 * `PushSubscription/set` — create, update and/or destroy push subscriptions.
 * The server verifies `url` on create: non-global IPs are rejected with
 * "Push subscription URLs must not point to a local or reserved IP address."
 * (`crates/jmap/src/push/set.rs:450-452`).
 */
export async function pushSubscriptionSet(
  options: PushSubscriptionSetOptions,
): PromiseResult<JmapSetResponse<PushSubscription>> {
  const op = "pushSubscriptionSet"
  const parsed = a.safeParse(pushSubscriptionSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const response = await stalwartMethodCall<JmapSetResponse<PushSubscription>>({
    config: parsed.output.config,
    methodName: "PushSubscription/set",
    arguments: bodyOmitUndefined({
      accountId: parsed.output.accountId ?? parsed.output.config.accountId,
      create: parsed.output.create,
      update: parsed.output.update,
      destroy: parsed.output.destroy,
    }),
  })
  if (!response.success) return response
  return jmapSetErrorCheck(op, response.data)
}
