import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import {
  mtaDeliveryScheduleSetOptionsSchema,
  type MtaDeliveryScheduleSetOptions,
} from "./mtaDeliveryScheduleSetOptionsSchema.js"

/**
 * `x:MtaDeliverySchedule/set` — create, update and/or destroy retry and notification intervals for message delivery.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry becomes a ResultErr.
 */
export async function mtaDeliveryScheduleSet(
  options: MtaDeliveryScheduleSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "mtaDeliveryScheduleSet"
  const parsed = a.safeParse(mtaDeliveryScheduleSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "MtaDeliverySchedule" })
}
