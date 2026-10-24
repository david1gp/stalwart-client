import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import type { RegistryCreated } from "../RegistryCreated.js"
import type { RegistryMaskedEmailCreate } from "../generated/RegistryMaskedEmailCreate.js"
import { registrySet } from "../registrySet.js"
import { type MaskedEmailCreateOptions, maskedEmailCreateOptionsSchema } from "./maskedEmailCreateOptionsSchema.js"

/**
 * `x:MaskedEmail/set` create — create one directory MaskedEmail entry.
 * The payload follows `RegistryMaskedEmailCreate` (see the generated type); only the
 * creation id `c1` of this call is returned.
 */
export async function maskedEmailCreate(options: MaskedEmailCreateOptions): PromiseResult<RegistryCreated> {
  const op = "maskedEmailCreate"
  const parsed = a.safeParse(maskedEmailCreateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const created = await registrySet({
    config: parsed.output.config,
    objectType: "MaskedEmail" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    create: { c1: parsed.output.maskedEmail as unknown as Record<string, unknown> },
  })
  if (!created.success) return created
  const record = created.data.created?.c1
  if (record === undefined)
    return createResultError(op, "server did not return the created object", JSON.stringify(created.data))
  return createResult(record)
}
