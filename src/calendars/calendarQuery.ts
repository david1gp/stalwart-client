import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { jmapAccountIdForCapability } from "../jmap/jmapAccountIdForCapability.js"
import { jmapCapabilities } from "../jmap/jmapCapabilities.js"
import type { JmapQueryResponse } from "../jmap/jmapQueryResponse.js"
import { type CalendarQueryOptions, calendarQueryOptionsSchema } from "./calendarQueryOptionsSchema.js"

/** `Calendar/query` — list calendar ids. */
export async function calendarQuery(options: CalendarQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "calendarQuery"
  const parsed = a.safeParse(calendarQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, filter, sort, position, anchor, anchorOffset, limit, calculateTotal } = parsed.output
  const resolved = await jmapAccountIdForCapability({ config, accountId, capability: jmapCapabilities.calendars })
  if (!resolved.success) return resolved
  const { accountId: resolvedAccountId, session } = resolved.data
  return stalwartMethodCall<JmapQueryResponse>({
    config,
    methodName: "Calendar/query",
    arguments: {
      accountId: resolvedAccountId,
      ...(filter !== undefined ? { filter } : {}),
      ...(sort !== undefined ? { sort } : {}),
      ...(position !== undefined ? { position } : {}),
      ...(anchor !== undefined ? { anchor } : {}),
      ...(anchorOffset !== undefined ? { anchorOffset } : {}),
      ...(limit !== undefined ? { limit } : {}),
      ...(calculateTotal !== undefined ? { calculateTotal } : {}),
    },
    ...(session !== undefined ? { session } : {}),
  })
}
