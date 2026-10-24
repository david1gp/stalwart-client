import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import { calendarRsvpPageOptionsSchema, type CalendarRsvpPageOptions } from "./calendarRsvpPageOptionsSchema.js"

/**
 * `GET /calendar/rsvp` — the static RSVP web page (`crates/http/src/request.rs:500`;
 * served gzipped; the enterprise template override at `request.rs:509` replaces it
 * when configured). Only served while `itip_http_rsvp_url` is set, otherwise the
 * path falls through to 404. Returns the raw page bytes. Anonymous.
 */
export async function calendarRsvpPage(options: CalendarRsvpPageOptions): PromiseResult<Uint8Array> {
  const op = "calendarRsvpPage"
  const parsed = a.safeParse(calendarRsvpPageOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return jmapHttpRequest({
    config: parsed.output.config,
    method: "GET",
    path: "/calendar/rsvp",
    responseType: "bytes",
    auth: false,
  })
}
