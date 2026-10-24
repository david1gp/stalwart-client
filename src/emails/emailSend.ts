import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { stalwartRequest } from "../client/stalwartRequest.js"
import { identityGet } from "../identities/identityGet.js"
import type { JmapSetResponse } from "../jmap/jmapSetResponse.js"
import { jmapSetErrorCheck } from "../jmap/jmapSetErrorCheck.js"
import { mailboxByRole } from "../mailboxes/mailboxByRole.js"
import { mailAccountIdResolve } from "../mailboxes/mailAccountIdResolve.js"
import type { Email } from "./Email.js"
import type { EmailSendResult } from "./EmailSendResult.js"
import { type EmailSendOptions, emailSendOptionsSchema } from "./emailSendOptionsSchema.js"
import type { EmailSubmission } from "../emailSubmissions/EmailSubmission.js"

const capability = "urn:ietf:params:jmap:mail"

/**
 * Send a message with one batched JMAP request: resolve the identity, create
 * the Email in Drafts, then `EmailSubmission/set` with `onSuccessUpdateEmail`
 * moving it to Sent (verified shape in `docs/local-instance.md`).
 *
 * Stalwart resolves `onSuccessUpdateEmail` keys against the *submission*
 * creation ids (`success_email_ids`, `crates/jmap/src/submission/set.rs:77`),
 * and patches use JSON-pointer form — keyed `"#s1"` with
 * `mailboxIds/<sent>: true` / `mailboxIds/<drafts>: null` (see
 * `tests/src/jmap/compliance/submission.rs:296` and
 * `crates/jmap-proto/src/request/parser.rs:907`).
 */
export async function emailSend(options: EmailSendOptions): PromiseResult<EmailSendResult> {
  const op = "emailSend"
  const parsed = a.safeParse(emailSendOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, identityId, from, to, cc, bcc, subject, text, html } = parsed.output
  if (text === undefined && html === undefined) {
    return createResultError(op, "emailSend needs at least one of text or html")
  }
  const resolved = await mailAccountIdResolve({ accountId, capability, config })
  if (!resolved.success) return resolved
  const sendConfig = { ...config, accountId: resolved.data.accountId }

  const senderIdentityId =
    identityId ??
    (await (async () => {
      const identities = await identityGet({ accountId: resolved.data.accountId, config })
      if (!identities.success) return undefined
      return identities.data.list[0]?.id
    })())
  if (senderIdentityId === undefined) return createResultError(op, "emailSend could not resolve an identityId")

  const [draftsId, sentId] = await Promise.all([
    mailboxByRole({ accountId: resolved.data.accountId, config, role: "drafts" }),
    mailboxByRole({ accountId: resolved.data.accountId, config, role: "sent" }),
  ])
  if (!draftsId.success) return draftsId
  if (!sentId.success) return sentId

  const addresses = (emails: readonly string[]) => emails.map((email) => ({ email }))
  const bodyParts: Record<string, unknown> = {}
  const bodyValues: Record<string, { value: string }> = {}
  if (text !== undefined) {
    bodyParts.textBody = [{ partId: "t1", type: "text/plain" }]
    bodyValues.t1 = { value: text }
  }
  if (html !== undefined) {
    bodyParts.htmlBody = [{ partId: "h1", type: "text/html" }]
    bodyValues.h1 = { value: html }
  }
  const batched = await stalwartRequest({
    config: sendConfig,
    ...(resolved.data.session === undefined ? {} : { session: resolved.data.session }),
    calls: [
      {
        methodName: "Email/set",
        callId: "m0",
        arguments: {
          accountId: resolved.data.accountId,
          create: {
            e1: {
              mailboxIds: { [draftsId.data]: true },
              from: [{ email: from }],
              to: addresses(to),
              ...(cc === undefined ? {} : { cc: addresses(cc) }),
              ...(bcc === undefined ? {} : { bcc: addresses(bcc) }),
              ...(subject === undefined ? {} : { subject }),
              ...bodyParts,
              bodyValues,
            },
          },
        },
      },
      {
        methodName: "EmailSubmission/set",
        callId: "m1",
        arguments: {
          accountId: resolved.data.accountId,
          create: {
            s1: {
              emailId: "#e1",
              envelope: { mailFrom: { email: from }, rcptTo: addresses(to) },
              identityId: senderIdentityId,
            },
          },
          onSuccessUpdateEmail: {
            "#s1": {
              [`mailboxIds/${sentId.data}`]: true,
              [`mailboxIds/${draftsId.data}`]: null,
              "keywords/$draft": null,
            },
          },
        },
      },
    ],
  })
  if (!batched.success) return batched
  const failed = batched.data.find((response) => response.methodName === "error")
  if (failed !== undefined) {
    return createResultError(op, "emailSend batch returned a method-level error", JSON.stringify(failed.arguments))
  }
  const emailResponse = batched.data.find((response) => response.callId === "m0")
  const submissionResponse = batched.data.find((response) => response.callId === "m1")
  if (emailResponse === undefined || submissionResponse === undefined) {
    return createResultError(op, "emailSend batch did not return both Email/set and EmailSubmission/set responses")
  }
  const emailChecked = jmapSetErrorCheck(op, emailResponse.arguments as JmapSetResponse<Email>)
  if (!emailChecked.success) return emailChecked
  const submissionChecked = jmapSetErrorCheck(op, submissionResponse.arguments as JmapSetResponse<EmailSubmission>)
  if (!submissionChecked.success) return submissionChecked
  return { success: true, data: { email: emailChecked.data, submission: submissionChecked.data } }
}
