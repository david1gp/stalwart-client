import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const userCreateOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  name: a.string(),
  domainId: a.string(),
  password: a.string(),
  roles: a.optional(a.record(a.string(), a.unknown())),
  description: a.optional(a.string()),
  accountId: a.optional(a.string()),
})

export type UserCreateOptions = a.InferInput<typeof userCreateOptionsSchema>
