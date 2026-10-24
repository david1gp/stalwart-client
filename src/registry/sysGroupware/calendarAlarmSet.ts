import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { calendarAlarmSetOptionsSchema, type CalendarAlarmSetOptions } from "./calendarAlarmSetOptionsSchema.js"

/**
 * `x:CalendarAlarm/set` — patch the calendar alarm email settings singleton.
 * Any `notUpdated` entry becomes a ResultErr via `jmapSetErrorCheck`.
 */
export async function calendarAlarmSet(
  options: CalendarAlarmSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "calendarAlarmSet"
  const parsed = a.safeParse(calendarAlarmSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const response = await registrySet({
    config: parsed.output.config,
    objectType: "CalendarAlarm",
    update: { singleton: parsed.output.patch },
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
  })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
