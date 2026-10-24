import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"
import { registryObjectTypeSchema } from "./registryObjectTypeSchema.js"

const registryPatchSchema = a.record(a.string(), a.unknown())

export const registrySetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  objectType: registryObjectTypeSchema,
  /** creation id → new object. Reference created ids later in the same request as `#<creationId>`. */
  create: a.optional(a.record(a.string(), registryPatchSchema)),
  /** id → JMAP PatchObject (`{"prop": value}` or `{"path/to/prop": value}`). Singletons use id `"singleton"`. */
  update: a.optional(a.record(a.string(), registryPatchSchema)),
  destroy: a.optional(a.array(a.string())),
  ifInState: a.optional(a.string()),
  accountId: a.optional(a.string()),
})

export type RegistrySetOptions = a.InferInput<typeof registrySetOptionsSchema>
