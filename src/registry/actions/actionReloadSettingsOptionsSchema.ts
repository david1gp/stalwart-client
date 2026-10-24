import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const actionReloadSettingsOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
})

export type ActionReloadSettingsOptions = a.InferInput<typeof actionReloadSettingsOptionsSchema>
