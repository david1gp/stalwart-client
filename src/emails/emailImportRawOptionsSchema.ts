import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

export const emailImportRawOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  /** Mailbox ids the imported message is added to. */
  mailboxIds: a.array(a.string()),
  keywords: a.optional(a.record(a.string(), a.boolean())),
  receivedAt: a.optional(a.string()),
  /** Full RFC 5322 message bytes (string or bytes). */
  raw: a.union([a.string(), a.instance(Uint8Array)]),
})

export type EmailImportRawOptions = a.InferInput<typeof emailImportRawOptionsSchema>
