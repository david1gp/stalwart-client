import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const roleCreateOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  role: a.record(a.string(), a.unknown()),
  accountId: a.optional(a.string()),
})

export type RoleCreateOptions = a.InferInput<typeof roleCreateOptionsSchema>
