import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const tenantCreateOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  tenant: a.record(a.string(), a.unknown()),
  accountId: a.optional(a.string()),
})

export type TenantCreateOptions = a.InferInput<typeof tenantCreateOptionsSchema>
