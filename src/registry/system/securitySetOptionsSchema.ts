import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const securitySetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  /** Patch applied to the singleton (`update: {"singleton": patch}`). */
  patch: a.record(a.string(), a.unknown()),
  accountId: a.optional(a.string()),
})

export type SecuritySetOptions = a.InferInput<typeof securitySetOptionsSchema>
