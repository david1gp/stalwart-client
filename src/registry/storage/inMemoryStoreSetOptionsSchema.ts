import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/**
 * `x:InMemoryStore/set` options. Singletons update under the `"singleton"` id.
 * Dangerous: repointing the store breaks the server — unit-test only.
 */
export const inMemoryStoreSetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  update: a.record(a.string(), a.record(a.string(), a.unknown())),
  ifInState: a.optional(a.string()),
  accountId: a.optional(a.string()),
})

export type InMemoryStoreSetOptions = a.InferInput<typeof inMemoryStoreSetOptionsSchema>
