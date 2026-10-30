import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * `Calendar/query` arguments. Since Stalwart v1 `CalendarFilter` accepts the
 * six metadata conditions (`metadataExists`/`privateMetadataExists`/
 * `metadataTextContains`/`privateMetadataTextContains`/`metadataTextEquals`/
 * `privateMetadataTextEquals`); anything else in the filter is ignored.
 */
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
