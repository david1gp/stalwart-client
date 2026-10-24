import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"
import { registryObjectTypeSchema } from "./registryObjectTypeSchema.js"

export const registryGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  objectType: registryObjectTypeSchema,
  /** Ids to fetch. Omit to fetch all (objects) or the singleton (singletons — `["singleton"]` is filled in). */
  ids: a.optional(a.array(a.string())),
  properties: a.optional(a.array(a.string())),
  accountId: a.optional(a.string()),
})

export type RegistryGetOptions = a.InferInput<typeof registryGetOptionsSchema>
