import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { clusterRoleQueryOptionsSchema, type ClusterRoleQueryOptions } from "./clusterRoleQueryOptionsSchema.js"

/**
 * `x:ClusterRole/query` — list cluster role ids with an optional
 * flat AND filter.
 */
export async function clusterRoleQuery(options: ClusterRoleQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "clusterRoleQuery"
  const parsed = a.safeParse(clusterRoleQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "ClusterRole" })
}
