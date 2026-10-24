import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { sysCalendarSetOptionsSchema, type SysCalendarSetOptions } from "./sysCalendarSetOptionsSchema.js"

/**
 * `x:Calendar/set` — patch the calendar server settings singleton.
 * Prefixed with `sys` because `calendarSet` is the standard JMAP
 * `Calendar/set` op. Any `notUpdated` entry becomes a ResultErr
 * via `jmapSetErrorCheck`.
 */
export async function sysCalendarSet(options: SysCalendarSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "sysCalendarSet"
  const parsed = a.safeParse(sysCalendarSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const response = await registrySet({
    config: parsed.output.config,
    objectType: "Calendar",
    update: { singleton: parsed.output.patch },
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
  })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
