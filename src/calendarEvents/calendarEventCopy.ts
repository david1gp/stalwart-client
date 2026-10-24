import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { jmapAccountIdResolve } from "../jmap/jmapAccountIdResolve.js"
import { jmapCapabilities } from "../jmap/jmapCapabilities.js"
import type { JmapCopyResponse } from "../jmap/jmapCopyResponse.js"
import { jmapSetErrorCheck } from "../jmap/jmapSetErrorCheck.js"
import { jmapSessionGet } from "../jmap/jmapSessionGet.js"
import type { JmapSession } from "../jmap/jmapSession.js"
import type { CalendarEvent } from "./CalendarEvent.js"
import { type CalendarEventCopyOptions, calendarEventCopyOptionsSchema } from "./calendarEventCopyOptionsSchema.js"

/**
 * `CalendarEvent/copy` — copy events from another account. Both account ids
 * are resolved independently; copying within one account is refused
 * server-side (`invalidArguments: "From accountId is equal to
 * fromAccountId"`, `crates/jmap/src/calendar_event/copy.rs:45-49`).
 */
export async function calendarEventCopy(
  options: CalendarEventCopyOptions,
): PromiseResult<JmapCopyResponse<CalendarEvent>> {
  const op = "calendarEventCopy"
  const parsed = a.safeParse(calendarEventCopyOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const {
    config,
    fromAccountId,
    ifFromInState,
    accountId,
    ifInState,
    create,
    onSuccessDestroyOriginal,
    destroyFromIfInState,
  } = parsed.output
  let resolvedAccountId = accountId ?? config.accountId
  let resolvedFromAccountId = fromAccountId
  let session: JmapSession | undefined
  if (resolvedAccountId === undefined || resolvedFromAccountId === undefined) {
    const sessionResult = await jmapSessionGet({ config })
    if (!sessionResult.success) return sessionResult
    session = sessionResult.data
    resolvedAccountId = jmapAccountIdResolve({
      accountId,
      config,
      session,
      capability: jmapCapabilities.calendars,
    })
    resolvedFromAccountId = jmapAccountIdResolve({
      accountId: fromAccountId,
      config,
      session,
      capability: jmapCapabilities.calendars,
    })
  }
  const response = await stalwartMethodCall<JmapCopyResponse<CalendarEvent>>({
    config,
    methodName: "CalendarEvent/copy",
    arguments: {
      ...(resolvedFromAccountId !== undefined ? { fromAccountId: resolvedFromAccountId } : {}),
      ...(ifFromInState !== undefined ? { ifFromInState } : {}),
      ...(resolvedAccountId !== undefined ? { accountId: resolvedAccountId } : {}),
      ...(ifInState !== undefined ? { ifInState } : {}),
      create,
      ...(onSuccessDestroyOriginal !== undefined ? { onSuccessDestroyOriginal } : {}),
      ...(destroyFromIfInState !== undefined ? { destroyFromIfInState } : {}),
    },
    ...(session !== undefined ? { session } : {}),
  })
  if (!response.success) return response
  const checked = jmapSetErrorCheck(op, response.data)
  if (!checked.success) return checked
  return createResult(response.data)
}
