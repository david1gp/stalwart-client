import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `Calendar/query` arguments (Stalwart's `Calendar::Filter` is `()`, so filter keys are ignored server-side). */
export const calendarQueryOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  filter: a.optional(a.record(a.string(), a.unknown())),
  sort: a.optional(a.array(a.object({ property: a.string(), isAscending: a.optional(a.boolean()) }))),
  position: a.optional(a.pipe(a.number(), a.integer())),
  anchor: a.optional(a.string()),
  anchorOffset: a.optional(a.pipe(a.number(), a.integer())),
  limit: a.optional(a.pipe(a.number(), a.integer(), a.minValue(0))),
  calculateTotal: a.optional(a.boolean()),
})

export type CalendarQueryOptions = a.InferInput<typeof calendarQueryOptionsSchema>
