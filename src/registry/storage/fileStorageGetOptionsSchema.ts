import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const fileStorageGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  properties: a.optional(a.array(a.string())),
  accountId: a.optional(a.string()),
})

export type FileStorageGetOptions = a.InferInput<typeof fileStorageGetOptionsSchema>
