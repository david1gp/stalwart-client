import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryTenant } from "../generated/RegistryTenant.js"
import { registryGet } from "../registryGet.js"
import { type TenantGetOptions, tenantGetOptionsSchema } from "./tenantGetOptionsSchema.js"

/**
 * `x:Tenant/get` — fetch directory Tenant entries by id.
 */
export async function tenantGet(
  options: TenantGetOptions,
): PromiseResult<JmapGetResponse<RegistryTenant & { id: string }>> {
  const op = "tenantGet"
  const parsed = a.safeParse(tenantGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registryGet({ config, objectType: "Tenant" as const, ...rest })
}
