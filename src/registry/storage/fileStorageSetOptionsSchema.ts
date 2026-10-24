import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/**
 * `x:FileStorage/set` options. Singletons update under the `"singleton"` id
 * with a JMAP PatchObject (`RegistryFileStorage` fields).
 */
export const fileStorageSetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  update: a.record(a.string(), a.record(a.string(), a.unknown())),
  ifInState: a.optional(a.string()),
  accountId: a.optional(a.string()),
})

export type FileStorageSetOptions = a.InferInput<typeof fileStorageSetOptionsSchema>
