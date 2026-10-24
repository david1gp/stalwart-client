import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryObjectMap } from "../generated/RegistryObjectMap.js"
import { registryGet } from "../registryGet.js"
import {
  mtaInboundSessionGetOptionsSchema,
  type MtaInboundSessionGetOptions,
} from "./mtaInboundSessionGetOptionsSchema.js"

/**
 * `x:MtaInboundSession/get` — fetch inbound SMTP session timeouts and transfer limits by id (all of them when `ids` is omitted).
 */
export async function mtaInboundSessionGet(
  options: MtaInboundSessionGetOptions,
): PromiseResult<JmapGetResponse<RegistryObjectMap["MtaInboundSession"]>> {
  const op = "mtaInboundSessionGet"
  const parsed = a.safeParse(mtaInboundSessionGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "MtaInboundSession" })
}
