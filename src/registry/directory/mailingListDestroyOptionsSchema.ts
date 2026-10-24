import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const mailingListDestroyOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  id: a.string(),
  accountId: a.optional(a.string()),
})

export type MailingListDestroyOptions = a.InferInput<typeof mailingListDestroyOptionsSchema>
