import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

export const emailSubmissionSetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  ifInState: a.optional(a.string()),
  create: a.optional(a.record(a.string(), a.record(a.string(), a.unknown()))),
  update: a.optional(a.record(a.string(), a.record(a.string(), a.unknown()))),
  destroy: a.optional(a.array(a.string())),
  /**
   * Email patches applied when the matching submission succeeds, keyed by
   * submission creation id (e.g. `{"#s1": {"mailboxIds/<sentId>": true}}`).
   * Patches use JSON-pointer form (`mailboxIds/<id>`, `keywords/$draft`).
   */
  onSuccessUpdateEmail: a.optional(a.record(a.string(), a.record(a.string(), a.unknown()))),
  onSuccessDestroyEmail: a.optional(a.array(a.string())),
})

export type EmailSubmissionSetOptions = a.InferInput<typeof emailSubmissionSetOptionsSchema>
