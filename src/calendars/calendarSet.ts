import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { jmapAccountIdForCapability } from "../jmap/jmapAccountIdForCapability.js"
import { jmapCapabilities } from "../jmap/jmapCapabilities.js"
import { jmapSetErrorCheck } from "../jmap/jmapSetErrorCheck.js"
import type { JmapSetResponse } from "../jmap/jmapSetResponse.js"
import type { Calendar } from "./Calendar.js"
import { type CalendarSetOptions, calendarSetOptionsSchema } from "./calendarSetOptionsSchema.js"

/** `Calendar/set` — create, update and/or destroy calendars. */
export async function calendarSet(options: CalendarSetOptions): PromiseResult<JmapSetResponse<Calendar>> {
  const op = "calendarSet"
  const parsed = a.safeParse(calendarSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, ifInState, create, update, destroy, onDestroyRemoveEvents, onSuccessSetIsDefault } =
    parsed.output
  const resolved = await jmapAccountIdForCapability({ config, accountId, capability: jmapCapabilities.calendars })
  if (!resolved.success) return resolved
  const { accountId: resolvedAccountId, session } = resolved.data
  const response = await stalwartMethodCall<JmapSetResponse<Calendar>>({
    config,
    methodName: "Calendar/set",
    arguments: {
      accountId: resolvedAccountId,
      ...(ifInState !== undefined ? { ifInState } : {}),
      ...(create !== undefined ? { create } : {}),
      ...(update !== undefined ? { update } : {}),
      ...(destroy !== undefined ? { destroy } : {}),
      ...(onDestroyRemoveEvents !== undefined ? { onDestroyRemoveEvents } : {}),
      ...(onSuccessSetIsDefault !== undefined ? { onSuccessSetIsDefault } : {}),
    },
    ...(session !== undefined ? { session } : {}),
  })
  if (!response.success) return response
  return jmapSetErrorCheck(op, response.data)
}
