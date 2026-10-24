import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const directoryGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  ids: a.optional(a.array(a.string())),
  properties: a.optional(a.array(a.string())),
  accountId: a.optional(a.string()),
})

export type DirectoryGetOptions = a.InferInput<typeof directoryGetOptionsSchema>
