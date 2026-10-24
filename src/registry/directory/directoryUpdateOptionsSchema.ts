import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const directoryUpdateOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  id: a.string(),
  patch: a.record(a.string(), a.unknown()),
  accountId: a.optional(a.string()),
})

export type DirectoryUpdateOptions = a.InferInput<typeof directoryUpdateOptionsSchema>
