import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/** Options for `mtaTlsStrategySet` (`x:<Type>/set`). At least one of `create`, `update` or `destroy` is required. */
export const mtaTlsStrategySetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  create: a.optional(a.record(a.string(), a.record(a.string(), a.unknown()))),
  update: a.optional(a.record(a.string(), a.record(a.string(), a.unknown()))),
  destroy: a.optional(a.array(a.string())),
  ifInState: a.optional(a.string()),
  accountId: a.optional(a.string()),
})

export type MtaTlsStrategySetOptions = a.InferInput<typeof mtaTlsStrategySetOptionsSchema>
