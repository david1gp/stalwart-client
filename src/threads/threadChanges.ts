import * as a from "valibot"
import { type PromiseResult } from "#result"
import { createResultError } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapChangesResponse } from "../jmap/jmapChangesResponse.js"
import { mailAccountIdResolve } from "../mailboxes/mailAccountIdResolve.js"
import { type ThreadChangesOptions, threadChangesOptionsSchema } from "./threadChangesOptionsSchema.js"

const capability = "urn:ietf:params:jmap:mail"

/** `Thread/changes` — created/updated/destroyed thread ids since `sinceState`. */
export async function threadChanges(options: ThreadChangesOptions): PromiseResult<JmapChangesResponse> {
  const op = "threadChanges"
  const parsed = a.safeParse(threadChangesOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, ...args } = parsed.output
  const resolved = await mailAccountIdResolve({ accountId, capability, config })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapChangesResponse>({
    config,
    methodName: "Thread/changes",
    arguments: bodyOmitUndefined({ accountId: resolved.data.accountId, ...args }),
    ...(resolved.data.session === undefined ? {} : { session: resolved.data.session }),
  })
}
