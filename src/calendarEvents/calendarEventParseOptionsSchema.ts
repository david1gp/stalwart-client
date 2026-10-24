import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * `CalendarEvent/parse` arguments (`crates/jmap-proto/src/method/parse.rs:20-25`):
 * blob ids of uploaded `.ics` files.
 */
export const calendarEventParseOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  blobIds: a.array(a.string()),
  properties: a.optional(a.array(a.string())),
})

export type CalendarEventParseOptions = a.InferInput<typeof calendarEventParseOptionsSchema>
