import * as a from "valibot"
import { type PromiseResult } from "#result"
import { createResultError } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapQueryChangesResponse } from "../jmap/jmapQueryChangesResponse.js"
import { mailAccountIdResolve } from "../mailboxes/mailAccountIdResolve.js"
import { type EmailQueryChangesOptions, emailQueryChangesOptionsSchema } from "./emailQueryChangesOptionsSchema.js"

const capability = "urn:ietf:params:jmap:mail"

/** `Email/queryChanges` — added/removed email ids since `sinceQueryState`. */
export async function emailQueryChanges(options: EmailQueryChangesOptions): PromiseResult<JmapQueryChangesResponse> {
  const op = "emailQueryChanges"
  const parsed = a.safeParse(emailQueryChangesOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, ...args } = parsed.output
  const resolved = await mailAccountIdResolve({ accountId, capability, config })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapQueryChangesResponse>({
    config,
    methodName: "Email/queryChanges",
    arguments: bodyOmitUndefined({ accountId: resolved.data.accountId, ...args }),
    ...(resolved.data.session === undefined ? {} : { session: resolved.data.session }),
  })
}
