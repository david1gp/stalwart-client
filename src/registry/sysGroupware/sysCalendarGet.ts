import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryCalendar } from "../generated/RegistryCalendar.js"
import { registryGet } from "../registryGet.js"
import { sysCalendarGetOptionsSchema, type SysCalendarGetOptions } from "./sysCalendarGetOptionsSchema.js"

/**
 * `x:Calendar/get` — read the calendar server settings singleton
 * (iCalendar limits, default names). Prefixed with `sys` because
 * `calendarGet` is the standard JMAP `Calendar/get` op.
 */
export async function sysCalendarGet(
  options: SysCalendarGetOptions,
): PromiseResult<JmapGetResponse<RegistryCalendar & { id: string }>> {
  const op = "sysCalendarGet"
  const parsed = a.safeParse(sysCalendarGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "Calendar" })
}
