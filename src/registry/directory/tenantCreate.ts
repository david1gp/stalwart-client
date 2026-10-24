import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import type { RegistryCreated } from "../RegistryCreated.js"
import type { RegistryTenantCreate } from "../generated/RegistryTenantCreate.js"
import { registrySet } from "../registrySet.js"
import { type TenantCreateOptions, tenantCreateOptionsSchema } from "./tenantCreateOptionsSchema.js"

/**
 * `x:Tenant/set` create — create one directory Tenant entry.
 * The payload follows `RegistryTenantCreate` (see the generated type); only the
 * creation id `c1` of this call is returned.
 */
export async function tenantCreate(options: TenantCreateOptions): PromiseResult<RegistryCreated> {
  const op = "tenantCreate"
  const parsed = a.safeParse(tenantCreateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const created = await registrySet({
    config: parsed.output.config,
    objectType: "Tenant" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    create: { c1: parsed.output.tenant as unknown as Record<string, unknown> },
  })
  if (!created.success) return created
  const record = created.data.created?.c1
  if (record === undefined)
    return createResultError(op, "server did not return the created object", JSON.stringify(created.data))
  return createResult(record)
}
