import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import type { RegistryCreated } from "../RegistryCreated.js"
import type { RegistryPublicKeyCreate } from "../generated/RegistryPublicKeyCreate.js"
import { registrySet } from "../registrySet.js"
import { type PublicKeyCreateOptions, publicKeyCreateOptionsSchema } from "./publicKeyCreateOptionsSchema.js"

/**
 * `x:PublicKey/set` create — create one directory PublicKey entry.
 * The payload follows `RegistryPublicKeyCreate` (see the generated type); only the
 * creation id `c1` of this call is returned.
 */
export async function publicKeyCreate(options: PublicKeyCreateOptions): PromiseResult<RegistryCreated> {
  const op = "publicKeyCreate"
  const parsed = a.safeParse(publicKeyCreateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const created = await registrySet({
    config: parsed.output.config,
    objectType: "PublicKey" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    create: { c1: parsed.output.publicKey as unknown as Record<string, unknown> },
  })
  if (!created.success) return created
  const record = created.data.created?.c1
  if (record === undefined)
    return createResultError(op, "server did not return the created object", JSON.stringify(created.data))
  return createResult(record)
}
