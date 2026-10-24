import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/**
 * `x:DataStore/set` options. Singletons update under the `"singleton"` id.
 * Dangerous: repointing the store breaks the server — unit-test only.
 */
export const dataStoreSetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  update: a.record(a.string(), a.record(a.string(), a.unknown())),
  ifInState: a.optional(a.string()),
  accountId: a.optional(a.string()),
})

export type DataStoreSetOptions = a.InferInput<typeof dataStoreSetOptionsSchema>
