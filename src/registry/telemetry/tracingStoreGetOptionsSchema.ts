import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const tracingStoreGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  properties: a.optional(a.array(a.string())),
  accountId: a.optional(a.string()),
})

export type TracingStoreGetOptions = a.InferInput<typeof tracingStoreGetOptionsSchema>
