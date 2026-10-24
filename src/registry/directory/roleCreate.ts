import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import type { RegistryCreated } from "../RegistryCreated.js"
import type { RegistryRoleCreate } from "../generated/RegistryRoleCreate.js"
import { registrySet } from "../registrySet.js"
import { type RoleCreateOptions, roleCreateOptionsSchema } from "./roleCreateOptionsSchema.js"

/**
 * `x:Role/set` create — create one directory Role entry.
 * The payload follows `RegistryRoleCreate` (see the generated type); only the
 * creation id `c1` of this call is returned.
 */
export async function roleCreate(options: RoleCreateOptions): PromiseResult<RegistryCreated> {
  const op = "roleCreate"
  const parsed = a.safeParse(roleCreateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const created = await registrySet({
    config: parsed.output.config,
    objectType: "Role" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    create: { c1: parsed.output.role as unknown as Record<string, unknown> },
  })
  if (!created.success) return created
  const record = created.data.created?.c1
  if (record === undefined)
    return createResultError(op, "server did not return the created object", JSON.stringify(created.data))
  return createResult(record)
}
