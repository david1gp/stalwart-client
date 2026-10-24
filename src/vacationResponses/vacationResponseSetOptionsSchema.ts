import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

export const vacationResponseSetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  ifInState: a.optional(a.string()),
  update: a.optional(a.record(a.string(), a.record(a.string(), a.unknown()))),
})

export type VacationResponseSetOptions = a.InferInput<typeof vacationResponseSetOptionsSchema>
