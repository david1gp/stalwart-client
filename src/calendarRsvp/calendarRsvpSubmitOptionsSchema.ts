import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * Options for `calendarRsvpSubmit`: answer an event invitation over HTTP.
 * A bare token fetches the invitation; `partstat` records the reply.
 * Valid values are `ACCEPTED`, `DECLINED`, `TENTATIVE`, `COMPLETED`, `IN-PROCESS`
 * (`RsvpRequest::part_stat`, `crates/groupware/src/calendar/itip.rs:556`).
 */
export const calendarRsvpSubmitOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  token: a.pipe(a.string(), a.minLength(1)),
  partstat: a.optional(a.string()),
  comment: a.optional(a.string()),
})

export type CalendarRsvpSubmitOptions = a.InferInput<typeof calendarRsvpSubmitOptionsSchema>
