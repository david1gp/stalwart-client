import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { jmapAccountIdForCapability } from "../jmap/jmapAccountIdForCapability.js"
import { jmapCapabilities } from "../jmap/jmapCapabilities.js"
import type { JmapQueryResponse } from "../jmap/jmapQueryResponse.js"
import { type CalendarEventQueryOptions, calendarEventQueryOptionsSchema } from "./calendarEventQueryOptionsSchema.js"

/** `CalendarEvent/query` — list event ids matching a filter. */
export async function calendarEventQuery(options: CalendarEventQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "calendarEventQuery"
  const parsed = a.safeParse(calendarEventQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const {
    config,
    accountId,
    filter,
    sort,
    position,
    anchor,
    anchorOffset,
    limit,
    calculateTotal,
    expandRecurrences,
    timeZone,
  } = parsed.output
  const resolved = await jmapAccountIdForCapability({ config, accountId, capability: jmapCapabilities.calendars })
  if (!resolved.success) return resolved
  const { accountId: resolvedAccountId, session } = resolved.data
  return stalwartMethodCall<JmapQueryResponse>({
    config,
    methodName: "CalendarEvent/query",
    arguments: {
      accountId: resolvedAccountId,
      ...(filter !== undefined ? { filter } : {}),
      ...(sort !== undefined ? { sort } : {}),
      ...(position !== undefined ? { position } : {}),
      ...(anchor !== undefined ? { anchor } : {}),
      ...(anchorOffset !== undefined ? { anchorOffset } : {}),
      ...(limit !== undefined ? { limit } : {}),
      ...(calculateTotal !== undefined ? { calculateTotal } : {}),
      ...(expandRecurrences !== undefined ? { expandRecurrences } : {}),
      ...(timeZone !== undefined ? { timeZone } : {}),
    },
    ...(session !== undefined ? { session } : {}),
  })
}
