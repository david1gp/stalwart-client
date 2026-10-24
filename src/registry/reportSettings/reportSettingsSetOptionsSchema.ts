import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/** Options for `reportSettingsSet` — singletons only support `update` (id `"singleton"`). */
export const reportSettingsSetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  update: a.record(a.string(), a.record(a.string(), a.unknown())),
  ifInState: a.optional(a.string()),
  accountId: a.optional(a.string()),
})

export type ReportSettingsSetOptions = a.InferInput<typeof reportSettingsSetOptionsSchema>
