import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type TenantDestroyOptions, tenantDestroyOptionsSchema } from "./tenantDestroyOptionsSchema.js"

/**
 * `x:Tenant/set` destroy — destroy one directory Tenant entry by id.
 */
export async function tenantDestroy(options: TenantDestroyOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "tenantDestroy"
  const parsed = a.safeParse(tenantDestroyOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({
    config: parsed.output.config,
    objectType: "Tenant" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    destroy: [parsed.output.id],
  })
}
