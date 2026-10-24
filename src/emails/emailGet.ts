import * as a from "valibot"
import { type PromiseResult } from "#result"
import { createResultError } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapGetResponse } from "../jmap/jmapGetResponse.js"
import { mailAccountIdResolve } from "../mailboxes/mailAccountIdResolve.js"
import type { Email } from "./Email.js"
import { type EmailGetOptions, emailGetOptionsSchema } from "./emailGetOptionsSchema.js"

const capability = "urn:ietf:params:jmap:mail"

/** `Email/get` — fetch emails by id (omit `ids` to fetch all). Body parts need `bodyProperties` + a fetch flag. */
export async function emailGet(options: EmailGetOptions): PromiseResult<JmapGetResponse<Email>> {
  const op = "emailGet"
  const parsed = a.safeParse(emailGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, ...args } = parsed.output
  const resolved = await mailAccountIdResolve({ accountId, capability, config })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapGetResponse<Email>>({
    config,
    methodName: "Email/get",
    arguments: bodyOmitUndefined({ accountId: resolved.data.accountId, ...args }),
    ...(resolved.data.session === undefined ? {} : { session: resolved.data.session }),
  })
}
