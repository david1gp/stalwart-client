import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/**
 * `x:Cache/set` options. Singletons update under the `"singleton"` id with a
 * JMAP PatchObject (`RegistryCache` fields, all numbers).
 */
export const cacheSetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  update: a.record(a.string(), a.record(a.string(), a.unknown())),
  ifInState: a.optional(a.string()),
  accountId: a.optional(a.string()),
})

export type CacheSetOptions = a.InferInput<typeof cacheSetOptionsSchema>
