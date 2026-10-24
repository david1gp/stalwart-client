import * as a from "valibot"
import { type PromiseResult } from "#result"
import { createResultError } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapGetResponse } from "../jmap/jmapGetResponse.js"
import { mailAccountIdResolve } from "../mailboxes/mailAccountIdResolve.js"
import type { VacationResponse } from "./VacationResponse.js"
import {
  type VacationResponseGetOptions,
  vacationResponseGetOptionsSchema,
} from "./vacationResponseGetOptionsSchema.js"

const capability = "urn:ietf:params:jmap:vacationresponse"

/** `VacationResponse/get` — fetch vacation responses (usually the singleton `vacationResponse/0`). */
export async function vacationResponseGet(
  options: VacationResponseGetOptions,
): PromiseResult<JmapGetResponse<VacationResponse>> {
  const op = "vacationResponseGet"
  const parsed = a.safeParse(vacationResponseGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, ...args } = parsed.output
  const resolved = await mailAccountIdResolve({ accountId, capability, config })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapGetResponse<VacationResponse>>({
    config,
    methodName: "VacationResponse/get",
    arguments: bodyOmitUndefined({ accountId: resolved.data.accountId, ...args }),
    ...(resolved.data.session === undefined ? {} : { session: resolved.data.session }),
  })
}
