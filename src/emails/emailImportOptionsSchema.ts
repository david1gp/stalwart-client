import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

export const emailImportOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  ifInState: a.optional(a.string()),
  /** One entry per imported message: `{<creationId>: {blobId, mailboxIds, keywords?, receivedAt?}}`. */
  emails: a.record(
    a.string(),
    a.object({
      blobId: a.string(),
      mailboxIds: a.record(a.string(), a.boolean()),
      keywords: a.optional(a.record(a.string(), a.boolean())),
      receivedAt: a.optional(a.string()),
    }),
  ),
})

export type EmailImportOptions = a.InferInput<typeof emailImportOptionsSchema>
