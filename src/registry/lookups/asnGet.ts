import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistryAsn } from "../generated/RegistryAsn.js"
import { asnGetOptionsSchema, type AsnGetOptions } from "./asnGetOptionsSchema.js"

/**
 * `x:Asn/get` — Configures ASN and geolocation data sources for IP address lookups.
 */
export async function asnGet(options: AsnGetOptions): PromiseResult<JmapGetResponse<RegistryAsn>> {
  const op = "asnGet"
  const parsed = a.safeParse(asnGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "Asn" })
}
