import * as a from "valibot"
import { type PromiseResult } from "#result"
import { createResultError } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapSetResponse } from "../jmap/jmapSetResponse.js"
import { jmapSetErrorCheck } from "../jmap/jmapSetErrorCheck.js"
import { mailAccountIdResolve } from "../mailboxes/mailAccountIdResolve.js"
import type { VacationResponse } from "./VacationResponse.js"
import {
  type VacationResponseSetOptions,
  vacationResponseSetOptionsSchema,
} from "./vacationResponseSetOptionsSchema.js"

const capability = "urn:ietf:params:jmap:vacationresponse"

/**
 * `VacationResponse/set` — update the vacation response (update-only: the
 * singleton id is derived server-side). Any `not*` entry makes the whole call
 * a ResultErr via `jmapSetErrorCheck`.
 */
export async function vacationResponseSet(
  options: VacationResponseSetOptions,
): PromiseResult<JmapSetResponse<VacationResponse>> {
  const op = "vacationResponseSet"
  const parsed = a.safeParse(vacationResponseSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, ...args } = parsed.output
  if (args.update === undefined) {
    return createResultError(op, "vacationResponseSet needs an update map")
  }
  const resolved = await mailAccountIdResolve({ accountId, capability, config })
  if (!resolved.success) return resolved
  const response = await stalwartMethodCall<JmapSetResponse<VacationResponse>>({
    config,
    methodName: "VacationResponse/set",
    arguments: bodyOmitUndefined({ accountId: resolved.data.accountId, ...args }),
    ...(resolved.data.session === undefined ? {} : { session: resolved.data.session }),
  })
  if (!response.success) return response
  return jmapSetErrorCheck(op, response.data)
}
