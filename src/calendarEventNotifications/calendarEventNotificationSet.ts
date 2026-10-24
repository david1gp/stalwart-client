import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { jmapAccountIdForCapability } from "../jmap/jmapAccountIdForCapability.js"
import { jmapCapabilities } from "../jmap/jmapCapabilities.js"
import { jmapSetErrorCheck } from "../jmap/jmapSetErrorCheck.js"
import type { JmapSetResponse } from "../jmap/jmapSetResponse.js"
import type { CalendarEventNotification } from "./CalendarEventNotification.js"
import {
  type CalendarEventNotificationSetOptions,
  calendarEventNotificationSetOptionsSchema,
} from "./calendarEventNotificationSetOptionsSchema.js"

/** `CalendarEventNotification/set` — create, update and/or destroy notifications (destroy acknowledges them). */
export async function calendarEventNotificationSet(
  options: CalendarEventNotificationSetOptions,
): PromiseResult<JmapSetResponse<CalendarEventNotification>> {
  const op = "calendarEventNotificationSet"
  const parsed = a.safeParse(calendarEventNotificationSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, ifInState, create, update, destroy } = parsed.output
  const resolved = await jmapAccountIdForCapability({ config, accountId, capability: jmapCapabilities.calendars })
  if (!resolved.success) return resolved
  const { accountId: resolvedAccountId, session } = resolved.data
  const response = await stalwartMethodCall<JmapSetResponse<CalendarEventNotification>>({
    config,
    methodName: "CalendarEventNotification/set",
    arguments: {
      accountId: resolvedAccountId,
      ...(ifInState !== undefined ? { ifInState } : {}),
      ...(create !== undefined ? { create } : {}),
      ...(update !== undefined ? { update } : {}),
      ...(destroy !== undefined ? { destroy } : {}),
    },
    ...(session !== undefined ? { session } : {}),
  })
  if (!response.success) return response
  return jmapSetErrorCheck(op, response.data)
}
