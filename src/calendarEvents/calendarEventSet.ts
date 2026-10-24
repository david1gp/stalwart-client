import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { jmapAccountIdForCapability } from "../jmap/jmapAccountIdForCapability.js"
import { jmapCapabilities } from "../jmap/jmapCapabilities.js"
import { jmapSetErrorCheck } from "../jmap/jmapSetErrorCheck.js"
import type { JmapSetResponse } from "../jmap/jmapSetResponse.js"
import type { CalendarEvent } from "./CalendarEvent.js"
import { type CalendarEventSetOptions, calendarEventSetOptionsSchema } from "./calendarEventSetOptionsSchema.js"

/** `CalendarEvent/set` — create, update and/or destroy events. */
export async function calendarEventSet(
  options: CalendarEventSetOptions,
): PromiseResult<JmapSetResponse<CalendarEvent>> {
  const op = "calendarEventSet"
  const parsed = a.safeParse(calendarEventSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, ifInState, create, update, destroy, sendSchedulingMessages } = parsed.output
  const resolved = await jmapAccountIdForCapability({ config, accountId, capability: jmapCapabilities.calendars })
  if (!resolved.success) return resolved
  const { accountId: resolvedAccountId, session } = resolved.data
  const response = await stalwartMethodCall<JmapSetResponse<CalendarEvent>>({
    config,
    methodName: "CalendarEvent/set",
    arguments: {
      accountId: resolvedAccountId,
      ...(ifInState !== undefined ? { ifInState } : {}),
      ...(create !== undefined ? { create } : {}),
      ...(update !== undefined ? { update } : {}),
      ...(destroy !== undefined ? { destroy } : {}),
      ...(sendSchedulingMessages !== undefined ? { sendSchedulingMessages } : {}),
    },
    ...(session !== undefined ? { session } : {}),
  })
  if (!response.success) return response
  return jmapSetErrorCheck(op, response.data)
}
