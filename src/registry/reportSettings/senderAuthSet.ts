import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { senderAuthSetOptionsSchema, type SenderAuthSetOptions } from "./senderAuthSetOptionsSchema.js"

/**
 * `x:SenderAuth/set` — Configures sender authentication verification including DKIM, SPF, DMARC, and ARC.
 */
export async function senderAuthSet(options: SenderAuthSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "senderAuthSet"
  const parsed = a.safeParse(senderAuthSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "SenderAuth" })
}
