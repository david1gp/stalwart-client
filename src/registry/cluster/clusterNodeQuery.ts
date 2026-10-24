import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { clusterNodeQueryOptionsSchema, type ClusterNodeQueryOptions } from "./clusterNodeQueryOptionsSchema.js"

/**
 * `x:ClusterNode/query` — list cluster node ids with an optional
 * flat AND filter (`crates/jmap/src/registry/query.rs:131`).
 */
export async function clusterNodeQuery(options: ClusterNodeQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "clusterNodeQuery"
  const parsed = a.safeParse(clusterNodeQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "ClusterNode" })
}
