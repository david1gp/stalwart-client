import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import type { RegistryCreated } from "../RegistryCreated.js"
import type { RegistryAccountCreate } from "../generated/RegistryAccountCreate.js"
import { registrySet } from "../registrySet.js"
import { type AccountCreateOptions, accountCreateOptionsSchema } from "./accountCreateOptionsSchema.js"

/**
 * `x:Account/set` create — create one directory Account entry.
 * The payload follows `RegistryAccountCreate` (see the generated type); only the
 * creation id `c1` of this call is returned.
 */
export async function accountCreate(options: AccountCreateOptions): PromiseResult<RegistryCreated> {
  const op = "accountCreate"
  const parsed = a.safeParse(accountCreateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const created = await registrySet({
    config: parsed.output.config,
    objectType: "Account" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    create: { c1: parsed.output.account as unknown as Record<string, unknown> },
  })
  if (!created.success) return created
  const record = created.data.created?.c1
  if (record === undefined)
    return createResultError(op, "server did not return the created object", JSON.stringify(created.data))
  return createResult(record)
}
