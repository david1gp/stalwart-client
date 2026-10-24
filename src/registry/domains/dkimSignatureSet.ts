import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { dkimSignatureSetOptionsSchema, type DkimSignatureSetOptions } from "./dkimSignatureSetOptionsSchema.js"

/**
 * `x:DkimSignature/set` — create, update and/or destroy DKIM signature used to sign outgoing email messages.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry becomes a ResultErr.
 */
export async function dkimSignatureSet(
  options: DkimSignatureSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "dkimSignatureSet"
  const parsed = a.safeParse(dkimSignatureSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "DkimSignature" })
}
