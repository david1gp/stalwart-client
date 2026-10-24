import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const roleUpdateOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  id: a.string(),
  patch: a.record(a.string(), a.unknown()),
  accountId: a.optional(a.string()),
})

export type RoleUpdateOptions = a.InferInput<typeof roleUpdateOptionsSchema>
