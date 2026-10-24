import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/** Options for `dmarcReportSettingsSet` — singletons only support `update` (id `"singleton"`). */
export const dmarcReportSettingsSetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  update: a.record(a.string(), a.record(a.string(), a.unknown())),
  ifInState: a.optional(a.string()),
  accountId: a.optional(a.string()),
})

export type DmarcReportSettingsSetOptions = a.InferInput<typeof dmarcReportSettingsSetOptionsSchema>
