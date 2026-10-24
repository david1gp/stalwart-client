import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `Calendar/changes` arguments. */
export const calendarChangesOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  sinceState: a.string(),
  maxChanges: a.optional(a.pipe(a.number(), a.integer(), a.minValue(0))),
})

export type CalendarChangesOptions = a.InferInput<typeof calendarChangesOptionsSchema>
