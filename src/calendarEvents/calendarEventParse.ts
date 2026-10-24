import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { jmapAccountIdForCapability } from "../jmap/jmapAccountIdForCapability.js"
import { jmapCapabilities } from "../jmap/jmapCapabilities.js"
import type { CalendarEventParseResponse } from "./CalendarEventParseResponse.js"
import { type CalendarEventParseOptions, calendarEventParseOptionsSchema } from "./calendarEventParseOptionsSchema.js"

/**
 * `CalendarEvent/parse` — parse uploaded `.ics` blobs into JSCalendar entries.
 * `using` includes the `:parse` extension URN (derived by `jmapMethodCapabilities`);
 * Stalwart itself enforces only the object capability (`crates/jmap/src/api/request.rs:109-110`).
 */
export async function calendarEventParse(
  options: CalendarEventParseOptions,
): PromiseResult<CalendarEventParseResponse> {
  const op = "calendarEventParse"
  const parsed = a.safeParse(calendarEventParseOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, blobIds, properties } = parsed.output
  const resolved = await jmapAccountIdForCapability({ config, accountId, capability: jmapCapabilities.calendars })
  if (!resolved.success) return resolved
  const { accountId: resolvedAccountId, session } = resolved.data
  return stalwartMethodCall<CalendarEventParseResponse>({
    config,
    methodName: "CalendarEvent/parse",
    arguments: {
      accountId: resolvedAccountId,
      blobIds,
      ...(properties !== undefined ? { properties } : {}),
    },
    ...(session !== undefined ? { session } : {}),
  })
}
