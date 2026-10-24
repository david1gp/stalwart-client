import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { dkimSignatureSet } from "./dkimSignatureSet.js"
import {
  dkimSignatureCreateOptionsSchema,
  type DkimSignatureCreateOptions,
} from "./dkimSignatureCreateOptionsSchema.js"

/**
 * Create an `x:DkimSignature` for any of the four DKIM algorithms
 * (`Dkim1Ed25519Sha256`, `Dkim1RsaSha256`, `Dkim2Ed25519Sha256`,
 * `Dkim2RsaSha256`). Secrets travel as `{@type: "Text", secret}` values
 * (`crates/registry/src/schema/…`, `RegistrySecretTextValue`). Returns the
 * created id.
 */
export async function dkimSignatureCreate(options: DkimSignatureCreateOptions): PromiseResult<{ id: string }> {
  const op = "dkimSignatureCreate"
  const parsed = a.safeParse(dkimSignatureCreateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, domainId, selector, privateKey, algorithm, report } = parsed.output
  const created = await dkimSignatureSet({
    config,
    create: {
      k1: {
        "@type": algorithm,
        domainId,
        selector,
        privateKey: { "@type": "Text", secret: privateKey },
        ...(algorithm.startsWith("Dkim2") ? { flags: parsed.output.flags ?? {} } : {}),
        ...(report !== undefined ? { report } : {}),
      },
    },
  })
  if (!created.success) return created
  const id = created.data.created?.k1?.id
  if (typeof id !== "string")
    return createResultError(op, "server created no DkimSignature", JSON.stringify(created.data))
  return createResult({ id })
}
