import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistrySenderAuth } from "../generated/RegistrySenderAuth.js"
import { senderAuthGetOptionsSchema, type SenderAuthGetOptions } from "./senderAuthGetOptionsSchema.js"

/**
 * `x:SenderAuth/get` — Configures sender authentication verification including DKIM, SPF, DMARC, and ARC.
 */
export async function senderAuthGet(options: SenderAuthGetOptions): PromiseResult<JmapGetResponse<RegistrySenderAuth>> {
  const op = "senderAuthGet"
  const parsed = a.safeParse(senderAuthGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "SenderAuth" })
}
