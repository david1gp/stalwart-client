import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const appPasswordCreateOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  /** Owning account id. Omit for the authenticated user's own account (server fills in the caller). */
  accountId: a.optional(a.string()),
  description: a.optional(a.string()),
  expiresAt: a.optional(a.nullable(a.string())),
  allowedIps: a.optional(a.record(a.string(), a.boolean())),
  permissions: a.optional(a.record(a.string(), a.unknown())),
})

export type AppPasswordCreateOptions = a.InferInput<typeof appPasswordCreateOptionsSchema>
