import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"
import { registryFilterSchema } from "./registryFilterSchema.js"
import { registryObjectTypeSchema } from "./registryObjectTypeSchema.js"

export const registryQueryOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  objectType: registryObjectTypeSchema,
  filter: a.optional(registryFilterSchema),
  sort: a.optional(a.array(a.object({ property: a.string(), isAscending: a.optional(a.boolean()) }))),
  position: a.optional(a.pipe(a.number(), a.integer())),
  anchor: a.optional(a.string()),
  anchorOffset: a.optional(a.pipe(a.number(), a.integer())),
  limit: a.optional(a.pipe(a.number(), a.integer(), a.minValue(0))),
  calculateTotal: a.optional(a.boolean()),
  accountId: a.optional(a.string()),
})

export type RegistryQueryOptions = a.InferInput<typeof registryQueryOptionsSchema>
