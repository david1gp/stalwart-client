import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const directoryCreateOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  directory: a.record(a.string(), a.unknown()),
  accountId: a.optional(a.string()),
})

export type DirectoryCreateOptions = a.InferInput<typeof directoryCreateOptionsSchema>
