import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { jmapAccountIdForCapability } from "../jmap/jmapAccountIdForCapability.js"
import { jmapCapabilities } from "../jmap/jmapCapabilities.js"
import type { JmapQueryChangesResponse } from "../jmap/jmapQueryChangesResponse.js"
import {
  type CalendarEventNotificationQueryChangesOptions,
  calendarEventNotificationQueryChangesOptionsSchema,
} from "./calendarEventNotificationQueryChangesOptionsSchema.js"

/** `CalendarEventNotification/queryChanges` — changes to a previous `CalendarEventNotification/query` result. */
export async function calendarEventNotificationQueryChanges(
  options: CalendarEventNotificationQueryChangesOptions,
): PromiseResult<JmapQueryChangesResponse> {
  const op = "calendarEventNotificationQueryChanges"
  const parsed = a.safeParse(calendarEventNotificationQueryChangesOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, sinceQueryState, maxChanges } = parsed.output
  const resolved = await jmapAccountIdForCapability({ config, accountId, capability: jmapCapabilities.calendars })
  if (!resolved.success) return resolved
  const { accountId: resolvedAccountId, session } = resolved.data
  return stalwartMethodCall<JmapQueryChangesResponse>({
    config,
    methodName: "CalendarEventNotification/queryChanges",
    arguments: {
      accountId: resolvedAccountId,
      sinceQueryState,
      ...(maxChanges !== undefined ? { maxChanges } : {}),
    },
    ...(session !== undefined ? { session } : {}),
  })
}
