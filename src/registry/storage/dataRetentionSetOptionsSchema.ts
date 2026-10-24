import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/**
 * `x:DataRetention/set` options. Singletons update under the `"singleton"` id
 * with a JMAP PatchObject (`RegistryDataRetention` fields).
 */
export const dataRetentionSetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  update: a.record(a.string(), a.record(a.string(), a.unknown())),
  ifInState: a.optional(a.string()),
  accountId: a.optional(a.string()),
})

export type DataRetentionSetOptions = a.InferInput<typeof dataRetentionSetOptionsSchema>
