import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { jmapAccountIdForCapability } from "../jmap/jmapAccountIdForCapability.js"
import { jmapCapabilities } from "../jmap/jmapCapabilities.js"
import type { JmapChangesResponse } from "../jmap/jmapChangesResponse.js"
import {
  type CalendarEventChangesOptions,
  calendarEventChangesOptionsSchema,
} from "./calendarEventChangesOptionsSchema.js"

/** `CalendarEvent/changes` — created/updated/destroyed event ids since a state. */
export async function calendarEventChanges(options: CalendarEventChangesOptions): PromiseResult<JmapChangesResponse> {
  const op = "calendarEventChanges"
  const parsed = a.safeParse(calendarEventChangesOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, sinceState, maxChanges } = parsed.output
  const resolved = await jmapAccountIdForCapability({ config, accountId, capability: jmapCapabilities.calendars })
  if (!resolved.success) return resolved
  const { accountId: resolvedAccountId, session } = resolved.data
  return stalwartMethodCall<JmapChangesResponse>({
    config,
    methodName: "CalendarEvent/changes",
    arguments: {
      accountId: resolvedAccountId,
      sinceState,
      ...(maxChanges !== undefined ? { maxChanges } : {}),
    },
    ...(session !== undefined ? { session } : {}),
  })
}
