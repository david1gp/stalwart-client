import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryCalendarAlarm } from "../generated/RegistryCalendarAlarm.js"
import { registryGet } from "../registryGet.js"
import { calendarAlarmGetOptionsSchema, type CalendarAlarmGetOptions } from "./calendarAlarmGetOptionsSchema.js"

/**
 * `x:CalendarAlarm/get` — read the calendar alarm email settings singleton.
 */
export async function calendarAlarmGet(
  options: CalendarAlarmGetOptions,
): PromiseResult<JmapGetResponse<RegistryCalendarAlarm & { id: string }>> {
  const op = "calendarAlarmGet"
  const parsed = a.safeParse(calendarAlarmGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "CalendarAlarm" })
}
