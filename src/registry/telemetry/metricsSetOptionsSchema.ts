import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/**
 * `x:Metrics/set` options. Singletons update under the `"singleton"` id;
 * the value is a JMAP PatchObject (`RegistryMetrics` fields).
 */
export const metricsSetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  update: a.record(a.string(), a.record(a.string(), a.unknown())),
  ifInState: a.optional(a.string()),
  accountId: a.optional(a.string()),
})

export type MetricsSetOptions = a.InferInput<typeof metricsSetOptionsSchema>
