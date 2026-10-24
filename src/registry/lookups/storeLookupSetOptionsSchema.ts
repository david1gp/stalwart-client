import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/** Options for `storeLookupSet`. */
export const storeLookupSetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  create: a.optional(a.record(a.string(), a.record(a.string(), a.unknown()))),
  update: a.optional(a.record(a.string(), a.record(a.string(), a.unknown()))),
  destroy: a.optional(a.array(a.string())),
  ifInState: a.optional(a.string()),
  accountId: a.optional(a.string()),
})

export type StoreLookupSetOptions = a.InferInput<typeof storeLookupSetOptionsSchema>
