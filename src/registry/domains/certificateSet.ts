import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { certificateSetOptionsSchema, type CertificateSetOptions } from "./certificateSetOptionsSchema.js"

/**
 * `x:Certificate/set` — create, update and/or destroy TLS certificate and its associated private key.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry becomes a ResultErr.
 */
export async function certificateSet(options: CertificateSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "certificateSet"
  const parsed = a.safeParse(certificateSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "Certificate" })
}
