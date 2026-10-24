import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { jmapAccountIdForCapability } from "../jmap/jmapAccountIdForCapability.js"
import { jmapCapabilities } from "../jmap/jmapCapabilities.js"
import type { JmapChangesResponse } from "../jmap/jmapChangesResponse.js"
import {
  type CalendarEventNotificationChangesOptions,
  calendarEventNotificationChangesOptionsSchema,
} from "./calendarEventNotificationChangesOptionsSchema.js"

/** `CalendarEventNotification/changes` — created/updated/destroyed notification ids since a state. */
export async function calendarEventNotificationChanges(
  options: CalendarEventNotificationChangesOptions,
): PromiseResult<JmapChangesResponse> {
  const op = "calendarEventNotificationChanges"
  const parsed = a.safeParse(calendarEventNotificationChangesOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, sinceState, maxChanges } = parsed.output
  const resolved = await jmapAccountIdForCapability({ config, accountId, capability: jmapCapabilities.calendars })
  if (!resolved.success) return resolved
  const { accountId: resolvedAccountId, session } = resolved.data
  return stalwartMethodCall<JmapChangesResponse>({
    config,
    methodName: "CalendarEventNotification/changes",
    arguments: {
      accountId: resolvedAccountId,
      sinceState,
      ...(maxChanges !== undefined ? { maxChanges } : {}),
    },
    ...(session !== undefined ? { session } : {}),
  })
}
