import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type TenantUpdateOptions, tenantUpdateOptionsSchema } from "./tenantUpdateOptionsSchema.js"

/**
 * `x:Tenant/set` update — update one directory Tenant entry by id.
 */
export async function tenantUpdate(options: TenantUpdateOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "tenantUpdate"
  const parsed = a.safeParse(tenantUpdateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({
    config: parsed.output.config,
    objectType: "Tenant" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    update: { [parsed.output.id]: parsed.output.patch },
  })
}
