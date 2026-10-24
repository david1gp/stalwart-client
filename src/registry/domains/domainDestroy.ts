import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { dkimSignatureQuery } from "./dkimSignatureQuery.js"
import { dkimSignatureSet } from "./dkimSignatureSet.js"
import { domainDestroyOptionsSchema, type DomainDestroyOptions } from "./domainDestroyOptionsSchema.js"
import { domainSet } from "./domainSet.js"

/**
 * Destroy an `x:Domain` and the `x:DkimSignature` objects the server
 * auto-provisioned for it. Creating a Domain provisions signatures that block
 * its destroy with `objectIsLinked`, so those are queried by `domainId` and
 * destroyed first, then the domain itself.
 */
export async function domainDestroy(
  options: DomainDestroyOptions,
): PromiseResult<{ destroyed: string; destroyedSignatures: string[] }> {
  const op = "domainDestroy"
  const parsed = a.safeParse(domainDestroyOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, id } = parsed.output
  const signatures = await dkimSignatureQuery({ config, filter: { domainId: id } })
  if (!signatures.success) return signatures
  const signatureIds = signatures.data.ids.map(String)
  if (signatureIds.length > 0) {
    const removed = await dkimSignatureSet({ config, destroy: signatureIds })
    if (!removed.success) return removed
  }
  const destroyed = await domainSet({ config, destroy: [id] })
  if (!destroyed.success) return destroyed
  return createResult({ destroyed: id, destroyedSignatures: signatureIds })
}
