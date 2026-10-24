import * as a from "valibot"
import { type PromiseResult } from "#result"
import { createResultError } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapGetResponse } from "../jmap/jmapGetResponse.js"
import { mailAccountIdResolve } from "../mailboxes/mailAccountIdResolve.js"
import type { Thread } from "./Thread.js"
import { type ThreadGetOptions, threadGetOptionsSchema } from "./threadGetOptionsSchema.js"

const capability = "urn:ietf:params:jmap:mail"

/** `Thread/get` — fetch threads by id (omit `ids` to fetch all). */
export async function threadGet(options: ThreadGetOptions): PromiseResult<JmapGetResponse<Thread>> {
  const op = "threadGet"
  const parsed = a.safeParse(threadGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, ...args } = parsed.output
  const resolved = await mailAccountIdResolve({ accountId, capability, config })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapGetResponse<Thread>>({
    config,
    methodName: "Thread/get",
    arguments: bodyOmitUndefined({ accountId: resolved.data.accountId, ...args }),
    ...(resolved.data.session === undefined ? {} : { session: resolved.data.session }),
  })
}
