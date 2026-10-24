import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { asnSetOptionsSchema, type AsnSetOptions } from "./asnSetOptionsSchema.js"

/**
 * `x:Asn/set` — Configures ASN and geolocation data sources for IP address lookups.
 */
export async function asnSet(options: AsnSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "asnSet"
  const parsed = a.safeParse(asnSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "Asn" })
}
