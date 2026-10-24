import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { type TenantQueryOptions, tenantQueryOptionsSchema } from "./tenantQueryOptionsSchema.js"

/**
 * `x:Tenant/query` — list directory Tenant ids with an optional filter/sort/page.
 */
export async function tenantQuery(options: TenantQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "tenantQuery"
  const parsed = a.safeParse(tenantQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registryQuery({ config, objectType: "Tenant" as const, ...rest })
}
