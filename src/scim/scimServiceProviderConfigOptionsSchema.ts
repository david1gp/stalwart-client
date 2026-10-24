import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `GET /scim/v2/ServiceProviderConfig` arguments (config only). */
export const scimServiceProviderConfigOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
})

export type ScimServiceProviderConfigOptions = a.InferInput<typeof scimServiceProviderConfigOptionsSchema>
