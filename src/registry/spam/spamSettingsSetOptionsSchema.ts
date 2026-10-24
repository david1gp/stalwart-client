import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/** Options for `spamSettingsSet` — singletons only support `update` (id `"singleton"`). */
export const spamSettingsSetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  update: a.record(a.string(), a.record(a.string(), a.unknown())),
  ifInState: a.optional(a.string()),
  accountId: a.optional(a.string()),
})

export type SpamSettingsSetOptions = a.InferInput<typeof spamSettingsSetOptionsSchema>
