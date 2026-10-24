import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** Options for `calendarRsvpPage`: fetch the static RSVP web page. */
export const calendarRsvpPageOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
})

export type CalendarRsvpPageOptions = a.InferInput<typeof calendarRsvpPageOptionsSchema>
