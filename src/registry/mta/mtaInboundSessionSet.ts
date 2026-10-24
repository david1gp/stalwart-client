import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import {
  mtaInboundSessionSetOptionsSchema,
  type MtaInboundSessionSetOptions,
} from "./mtaInboundSessionSetOptionsSchema.js"

/**
 * `x:MtaInboundSession/set` — create, update and/or destroy inbound SMTP session timeouts and transfer limits.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry becomes a ResultErr.
 */
export async function mtaInboundSessionSet(
  options: MtaInboundSessionSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "mtaInboundSessionSet"
  const parsed = a.safeParse(mtaInboundSessionSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "MtaInboundSession" })
}
