import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const systemSettingsSetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  /** Patch applied to the singleton (`update: {"singleton": patch}`). Durations are ms numbers, not strings. */
  patch: a.record(a.string(), a.unknown()),
  accountId: a.optional(a.string()),
})

export type SystemSettingsSetOptions = a.InferInput<typeof systemSettingsSetOptionsSchema>
