import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const metricsGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  properties: a.optional(a.array(a.string())),
  accountId: a.optional(a.string()),
})

export type MetricsGetOptions = a.InferInput<typeof metricsGetOptionsSchema>
