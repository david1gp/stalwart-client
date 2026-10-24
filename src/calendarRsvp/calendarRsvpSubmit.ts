import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import type { CalendarRsvpResponse } from "./CalendarRsvpResponse.js"
import { calendarRsvpSubmitOptionsSchema, type CalendarRsvpSubmitOptions } from "./calendarRsvpSubmitOptionsSchema.js"

const calendarRsvpResponseSchema = a.variant("type", [
  a.looseObject({ type: a.literal("invitation") }),
  a.looseObject({ type: a.literal("recorded") }),
  a.looseObject({ type: a.literal("error") }),
])

/**
 * `POST /api/calendar/rsvp` — answer an event invitation over HTTP
 * (`RsvpRequest`, `crates/http/src/api/mod.rs:81`; handled by
 * `http_rsvp_handle`, `crates/groupware/src/calendar/itip.rs:372`).
 * A bare token returns the invitation; `partstat` records the reply; a bad
 * token is a 200 `{type: "error", reason: "invalidLink", …}`, not an HTTP error.
 * Only routed while `itip_http_rsvp_url` is set, otherwise the path 404s.
 * Anonymous, rate-limited.
 */
export async function calendarRsvpSubmit(options: CalendarRsvpSubmitOptions): PromiseResult<CalendarRsvpResponse> {
  const op = "calendarRsvpSubmit"
  const parsed = a.safeParse(calendarRsvpSubmitOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const raw = await jmapHttpRequest({
    config: parsed.output.config,
    method: "POST",
    path: "/api/calendar/rsvp",
    body: {
      kind: "json",
      value: {
        token: parsed.output.token,
        ...(parsed.output.partstat === undefined ? {} : { partstat: parsed.output.partstat }),
        ...(parsed.output.comment === undefined ? {} : { comment: parsed.output.comment }),
      },
    },
    responseType: "json",
    auth: false,
  })
  if (!raw.success) return raw
  const typed = a.safeParse(calendarRsvpResponseSchema, raw.data)
  if (!typed.success) {
    return createResultError(op, `Unexpected RSVP response shape: ${a.summarize(typed.issues)}`)
  }
  return createResult(typed.output as CalendarRsvpResponse)
}
