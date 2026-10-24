import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryObjectMap } from "../generated/RegistryObjectMap.js"
import { registryGet } from "../registryGet.js"
import {
  mtaDeliveryScheduleGetOptionsSchema,
  type MtaDeliveryScheduleGetOptions,
} from "./mtaDeliveryScheduleGetOptionsSchema.js"

/**
 * `x:MtaDeliverySchedule/get` — fetch retry and notification intervals for message delivery by id (all of them when `ids` is omitted).
 */
export async function mtaDeliveryScheduleGet(
  options: MtaDeliveryScheduleGetOptions,
): PromiseResult<JmapGetResponse<RegistryObjectMap["MtaDeliverySchedule"]>> {
  const op = "mtaDeliveryScheduleGet"
  const parsed = a.safeParse(mtaDeliveryScheduleGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "MtaDeliverySchedule" })
}
