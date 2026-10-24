import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type TenantSetOptions, tenantSetOptionsSchema } from "./tenantSetOptionsSchema.js"

/**
 * `x:Tenant/set` — create, update and/or destroy directory Tenant entries.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry makes the call a ResultErr.
 */
export async function tenantSet(options: TenantSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "tenantSet"
  const parsed = a.safeParse(tenantSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registrySet({ config, objectType: "Tenant" as const, ...rest })
}
