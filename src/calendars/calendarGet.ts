import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { jmapAccountIdForCapability } from "../jmap/jmapAccountIdForCapability.js"
import { jmapCapabilities } from "../jmap/jmapCapabilities.js"
import type { JmapGetResponse } from "../jmap/jmapGetResponse.js"
import type { Calendar } from "./Calendar.js"
import { type CalendarGetOptions, calendarGetOptionsSchema } from "./calendarGetOptionsSchema.js"

/** `Calendar/get` — fetch calendars by id. */
export async function calendarGet(options: CalendarGetOptions): PromiseResult<JmapGetResponse<Calendar>> {
  const op = "calendarGet"
  const parsed = a.safeParse(calendarGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, ids, properties } = parsed.output
  const resolved = await jmapAccountIdForCapability({ config, accountId, capability: jmapCapabilities.calendars })
  if (!resolved.success) return resolved
  const { accountId: resolvedAccountId, session } = resolved.data
  return stalwartMethodCall<JmapGetResponse<Calendar>>({
    config,
    methodName: "Calendar/get",
    arguments: {
      accountId: resolvedAccountId,
      ...(ids !== undefined ? { ids } : {}),
      ...(properties !== undefined ? { properties } : {}),
    },
    ...(session !== undefined ? { session } : {}),
  })
}
