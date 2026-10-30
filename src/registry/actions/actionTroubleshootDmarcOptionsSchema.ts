import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const actionTroubleshootDmarcOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  ehloDomain: a.pipe(a.string(), a.minLength(1)),
  mailFrom: a.pipe(a.string(), a.minLength(1)),
  message: a.optional(a.string()),
  remoteIp: a.pipe(a.string(), a.minLength(1)),
  spfEhloDomain: a.pipe(a.string(), a.minLength(1)),
  spfMailFromDomain: a.pipe(a.string(), a.minLength(1)),
  /** RCPT TO addresses as a set (`{"user@example.test": true}`). Renamed from `to` in Stalwart v1. */
  rcptTo: a.record(a.string(), a.literal(true)),
  accountId: a.optional(a.string()),
})

export type ActionTroubleshootDmarcOptions = a.InferInput<typeof actionTroubleshootDmarcOptionsSchema>
