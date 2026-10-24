import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { jmapAccountIdForCapability } from "../jmap/jmapAccountIdForCapability.js"
import { jmapCapabilities } from "../jmap/jmapCapabilities.js"
import type { JmapGetResponse } from "../jmap/jmapGetResponse.js"
import type { CalendarEventNotification } from "./CalendarEventNotification.js"
import {
  type CalendarEventNotificationGetOptions,
  calendarEventNotificationGetOptionsSchema,
} from "./calendarEventNotificationGetOptionsSchema.js"

/** `CalendarEventNotification/get` — fetch notifications by id. */
export async function calendarEventNotificationGet(
  options: CalendarEventNotificationGetOptions,
): PromiseResult<JmapGetResponse<CalendarEventNotification>> {
  const op = "calendarEventNotificationGet"
  const parsed = a.safeParse(calendarEventNotificationGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, ids, properties } = parsed.output
  const resolved = await jmapAccountIdForCapability({ config, accountId, capability: jmapCapabilities.calendars })
  if (!resolved.success) return resolved
  const { accountId: resolvedAccountId, session } = resolved.data
  return stalwartMethodCall<JmapGetResponse<CalendarEventNotification>>({
    config,
    methodName: "CalendarEventNotification/get",
    arguments: {
      accountId: resolvedAccountId,
      ...(ids !== undefined ? { ids } : {}),
      ...(properties !== undefined ? { properties } : {}),
    },
    ...(session !== undefined ? { session } : {}),
  })
}
