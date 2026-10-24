import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const accountSettingsUpdateOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  patch: a.record(a.string(), a.unknown()),
  accountId: a.optional(a.string()),
})

export type AccountSettingsUpdateOptions = a.InferInput<typeof accountSettingsUpdateOptionsSchema>
