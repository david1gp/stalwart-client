import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const oidcProviderUpdateOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  patch: a.record(a.string(), a.unknown()),
  accountId: a.optional(a.string()),
})

export type OidcProviderUpdateOptions = a.InferInput<typeof oidcProviderUpdateOptionsSchema>
