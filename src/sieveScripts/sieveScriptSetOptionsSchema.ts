import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `SieveScript/set` arguments (`crates/jmap/src/sieve/set.rs`). */
export const sieveScriptSetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  ifInState: a.optional(a.string()),
  create: a.optional(a.record(a.string(), a.record(a.string(), a.unknown()))),
  update: a.optional(a.record(a.string(), a.record(a.string(), a.unknown()))),
  destroy: a.optional(a.array(a.string())),
  onSuccessActivateScript: a.optional(a.string()),
  onSuccessDeactivateScript: a.optional(a.boolean()),
})

export type SieveScriptSetOptions = a.InferInput<typeof sieveScriptSetOptionsSchema>
