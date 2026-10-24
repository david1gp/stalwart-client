import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const logQueryOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  /** Free-text match against the raw log line. The only server-side filter. */
  filter: a.optional(
    a.object({
      text: a.optional(a.pipe(a.string(), a.minLength(1))),
    }),
  ),
  sort: a.optional(a.array(a.object({ property: a.string(), isAscending: a.optional(a.boolean()) }))),
  anchor: a.optional(a.string()),
  anchorOffset: a.optional(a.pipe(a.number(), a.integer())),
  limit: a.optional(a.pipe(a.number(), a.integer(), a.minValue(0))),
  calculateTotal: a.optional(a.boolean()),
  accountId: a.optional(a.string()),
})

export type LogQueryOptions = a.InferInput<typeof logQueryOptionsSchema>
