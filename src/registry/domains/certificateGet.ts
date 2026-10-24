import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryObjectMap } from "../generated/RegistryObjectMap.js"
import { registryGet } from "../registryGet.js"
import { certificateGetOptionsSchema, type CertificateGetOptions } from "./certificateGetOptionsSchema.js"

/**
 * `x:Certificate/get` — fetch TLS certificate and its associated private key by id (all of them when `ids` is omitted).
 */
export async function certificateGet(
  options: CertificateGetOptions,
): PromiseResult<JmapGetResponse<RegistryObjectMap["Certificate"]>> {
  const op = "certificateGet"
  const parsed = a.safeParse(certificateGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "Certificate" })
}
