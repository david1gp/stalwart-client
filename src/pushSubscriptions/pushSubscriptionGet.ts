import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapGetResponse } from "../jmap/jmapGetResponse.js"
import {
  pushSubscriptionGetOptionsSchema,
  type PushSubscriptionGetOptions,
} from "./pushSubscriptionGetOptionsSchema.js"
import type { PushSubscription } from "./PushSubscription.js"

/**
 * `PushSubscription/get` — fetch push subscriptions (capability is core,
 * `crates/jmap-proto/src/request/method.rs:53`). Unlike other methods the
 * server auto-fills a missing accountId with the caller account
 * (`resolve_account_id`, `crates/jmap/src/api/request.rs:726-731`), and the
 * session carries no core primary account for regular users — so no session
 * lookup happens here; accountId is sent only when the caller provides one.
 */
export async function pushSubscriptionGet(
  options: PushSubscriptionGetOptions,
): PromiseResult<JmapGetResponse<PushSubscription>> {
  const op = "pushSubscriptionGet"
  const parsed = a.safeParse(pushSubscriptionGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return stalwartMethodCall<JmapGetResponse<PushSubscription>>({
    config: parsed.output.config,
    methodName: "PushSubscription/get",
    arguments: bodyOmitUndefined({
      accountId: parsed.output.accountId ?? parsed.output.config.accountId,
      ids: parsed.output.ids,
      properties: parsed.output.properties,
    }),
  })
}
