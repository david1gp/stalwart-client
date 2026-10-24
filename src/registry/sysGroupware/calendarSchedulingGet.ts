import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryCalendarScheduling } from "../generated/RegistryCalendarScheduling.js"
import { registryGet } from "../registryGet.js"
import {
  calendarSchedulingGetOptionsSchema,
  type CalendarSchedulingGetOptions,
} from "./calendarSchedulingGetOptionsSchema.js"

/**
 * `x:CalendarScheduling/get` — read the calendar scheduling singleton
 * (iTIP messaging, HTTP RSVP settings).
 */
export async function calendarSchedulingGet(
  options: CalendarSchedulingGetOptions,
): PromiseResult<JmapGetResponse<RegistryCalendarScheduling & { id: string }>> {
  const op = "calendarSchedulingGet"
  const parsed = a.safeParse(calendarSchedulingGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "CalendarScheduling" })
}
