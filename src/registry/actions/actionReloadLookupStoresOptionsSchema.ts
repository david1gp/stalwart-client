import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const actionReloadLookupStoresOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
})

export type ActionReloadLookupStoresOptions = a.InferInput<typeof actionReloadLookupStoresOptionsSchema>
