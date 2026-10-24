import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const accountPasswordUpdateOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  patch: a.record(a.string(), a.unknown()),
  accountId: a.optional(a.string()),
})

export type AccountPasswordUpdateOptions = a.InferInput<typeof accountPasswordUpdateOptionsSchema>
