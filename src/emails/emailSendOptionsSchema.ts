import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

export const emailSendOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  /** Identity id to send from (default: first `Identity/get` result — ids are unstable, so always resolve). */
  identityId: a.optional(a.string()),
  from: a.string(),
  to: a.array(a.string()),
  cc: a.optional(a.array(a.string())),
  bcc: a.optional(a.array(a.string())),
  subject: a.optional(a.string()),
  text: a.optional(a.string()),
  html: a.optional(a.string()),
})

export type EmailSendOptions = a.InferInput<typeof emailSendOptionsSchema>
