import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const inMemoryStoreGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  properties: a.optional(a.array(a.string())),
  accountId: a.optional(a.string()),
})

export type InMemoryStoreGetOptions = a.InferInput<typeof inMemoryStoreGetOptionsSchema>
