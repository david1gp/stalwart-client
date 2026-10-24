import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { jmapAccountIdForCapability } from "../jmap/jmapAccountIdForCapability.js"
import { jmapCapabilities } from "../jmap/jmapCapabilities.js"
import type { JmapGetResponse } from "../jmap/jmapGetResponse.js"
import type { CalendarEvent } from "./CalendarEvent.js"
import { type CalendarEventGetOptions, calendarEventGetOptionsSchema } from "./calendarEventGetOptionsSchema.js"

/** `CalendarEvent/get` — fetch events by id. */
export async function calendarEventGet(
  options: CalendarEventGetOptions,
): PromiseResult<JmapGetResponse<CalendarEvent>> {
  const op = "calendarEventGet"
  const parsed = a.safeParse(calendarEventGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const {
    config,
    accountId,
    ids,
    properties,
    recurrenceOverridesBefore,
    recurrenceOverridesAfter,
    reduceParticipants,
    timeZone,
  } = parsed.output
  const resolved = await jmapAccountIdForCapability({ config, accountId, capability: jmapCapabilities.calendars })
  if (!resolved.success) return resolved
  const { accountId: resolvedAccountId, session } = resolved.data
  return stalwartMethodCall<JmapGetResponse<CalendarEvent>>({
    config,
    methodName: "CalendarEvent/get",
    arguments: {
      accountId: resolvedAccountId,
      ...(ids !== undefined ? { ids } : {}),
      ...(properties !== undefined ? { properties } : {}),
      ...(recurrenceOverridesBefore !== undefined ? { recurrenceOverridesBefore } : {}),
      ...(recurrenceOverridesAfter !== undefined ? { recurrenceOverridesAfter } : {}),
      ...(reduceParticipants !== undefined ? { reduceParticipants } : {}),
      ...(timeZone !== undefined ? { timeZone } : {}),
    },
    ...(session !== undefined ? { session } : {}),
  })
}
