import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryObjectMap } from "../generated/RegistryObjectMap.js"
import { registryGet } from "../registryGet.js"
import { dkimSignatureGetOptionsSchema, type DkimSignatureGetOptions } from "./dkimSignatureGetOptionsSchema.js"

/**
 * `x:DkimSignature/get` — fetch DKIM signature used to sign outgoing email messages by id (all of them when `ids` is omitted).
 */
export async function dkimSignatureGet(
  options: DkimSignatureGetOptions,
): PromiseResult<JmapGetResponse<RegistryObjectMap["DkimSignature"]>> {
  const op = "dkimSignatureGet"
  const parsed = a.safeParse(dkimSignatureGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "DkimSignature" })
}
