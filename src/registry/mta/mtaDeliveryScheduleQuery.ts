import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import {
  mtaDeliveryScheduleQueryOptionsSchema,
  type MtaDeliveryScheduleQueryOptions,
} from "./mtaDeliveryScheduleQueryOptionsSchema.js"

/**
 * `x:MtaDeliverySchedule/query` — list retry and notification intervals for message delivery ids with an optional filter/sort/page.
 */
export async function mtaDeliveryScheduleQuery(
  options: MtaDeliveryScheduleQueryOptions,
): PromiseResult<JmapQueryResponse> {
  const op = "mtaDeliveryScheduleQuery"
  const parsed = a.safeParse(mtaDeliveryScheduleQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "MtaDeliverySchedule" })
}
