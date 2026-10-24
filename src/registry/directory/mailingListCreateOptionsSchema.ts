import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const mailingListCreateOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  mailingList: a.record(a.string(), a.unknown()),
  accountId: a.optional(a.string()),
})

export type MailingListCreateOptions = a.InferInput<typeof mailingListCreateOptionsSchema>
