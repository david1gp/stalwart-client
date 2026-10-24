import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `CalendarEvent/queryChanges` arguments. */
export const calendarEventQueryChangesOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  sinceQueryState: a.string(),
  maxChanges: a.optional(a.pipe(a.number(), a.integer(), a.minValue(0))),
})

export type CalendarEventQueryChangesOptions = a.InferInput<typeof calendarEventQueryChangesOptionsSchema>
