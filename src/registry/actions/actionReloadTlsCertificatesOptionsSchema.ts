import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const actionReloadTlsCertificatesOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
})

export type ActionReloadTlsCertificatesOptions = a.InferInput<typeof actionReloadTlsCertificatesOptionsSchema>
