import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const actionClassifySpamOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  authenticatedAs: a.optional(a.string()),
  ehloDomain: a.pipe(a.string(), a.minLength(1)),
  envFrom: a.pipe(a.string(), a.minLength(1)),
  envFromParameters: a.optional(
    a.picklist(["binaryMime", "bit7", "bit8Mime - 8-bit MIME message content", "smtpUtf8"]),
  ),
  /** RCPT TO addresses as a set (`{"user@example.test": true}`). */
  envRcptTo: a.record(a.string(), a.literal(true)),
  isTls: a.optional(a.boolean()),
  /** Raw email message to classify. */
  message: a.pipe(a.string(), a.minLength(1)),
  remoteIp: a.pipe(a.string(), a.minLength(1)),
  accountId: a.optional(a.string()),
})

export type ActionClassifySpamOptions = a.InferInput<typeof actionClassifySpamOptionsSchema>
