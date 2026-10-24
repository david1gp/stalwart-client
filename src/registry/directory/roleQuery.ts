import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { type RoleQueryOptions, roleQueryOptionsSchema } from "./roleQueryOptionsSchema.js"

/**
 * `x:Role/query` — list directory Role ids with an optional filter/sort/page.
 */
export async function roleQuery(options: RoleQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "roleQuery"
  const parsed = a.safeParse(roleQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registryQuery({ config, objectType: "Role" as const, ...rest })
}
