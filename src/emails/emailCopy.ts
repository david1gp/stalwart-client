import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapCopyResponse } from "../jmap/jmapCopyResponse.js"
import { mailAccountIdResolve } from "../mailboxes/mailAccountIdResolve.js"
import type { Email } from "./Email.js"
import { type EmailCopyOptions, emailCopyOptionsSchema } from "./emailCopyOptionsSchema.js"

const capability = "urn:ietf:params:jmap:mail"

/**
 * `Email/copy` — copy emails between accounts (same-account copies are
 * rejected server-side: `crates/jmap/src/email/copy.rs:65`).
 *
 * Stalwart deviation: the request takes `create` (`{<creationId>: {id, ...}}`),
 * not the RFC 8621 `creationIds` array
 * (`crates/jmap-proto/src/method/copy.rs:96`). A non-empty `notCreated` map
 * becomes a ResultErr carrying the full CopyResponse as errorData.
 */
export async function emailCopy(options: EmailCopyOptions): PromiseResult<JmapCopyResponse<Email>> {
  const op = "emailCopy"
  const parsed = a.safeParse(emailCopyOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, fromAccountId, ...args } = parsed.output
  const [toAccount, fromAccount] = await Promise.all([
    mailAccountIdResolve({ accountId, capability, config }),
    mailAccountIdResolve({ accountId: fromAccountId, capability, config }),
  ])
  if (!toAccount.success) return toAccount
  if (!fromAccount.success) return fromAccount
  const response = await stalwartMethodCall<JmapCopyResponse<Email>>({
    config,
    methodName: "Email/copy",
    arguments: bodyOmitUndefined({
      accountId: toAccount.data.accountId,
      fromAccountId: fromAccount.data.accountId,
      ...args,
    }),
    ...(toAccount.data.session === undefined ? {} : { session: toAccount.data.session }),
  })
  if (!response.success) return response
  if (response.data.notCreated !== undefined && Object.keys(response.data.notCreated).length > 0) {
    const [firstId, firstError] = Object.entries(response.data.notCreated)[0] as [
      string,
      { type: string; description?: string },
    ]
    return createResultError(
      op,
      `Copy partially failed: notCreated: ${firstId} (${firstError.type}${firstError.description ? `: ${firstError.description}` : ""})`,
      JSON.stringify(response.data),
    )
  }
  return response
}
