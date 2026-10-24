import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryClusterNode } from "../generated/RegistryClusterNode.js"
import { registryGet } from "../registryGet.js"
import { clusterNodeGetOptionsSchema, type ClusterNodeGetOptions } from "./clusterNodeGetOptionsSchema.js"

/**
 * `x:ClusterNode/get` — fetch cluster nodes by id. Nodes are read-only;
 * there is no `clusterNodeSet` (every set fails server-side,
 * `crates/jmap/src/registry/set.rs:780`).
 */
export async function clusterNodeGet(
  options: ClusterNodeGetOptions,
): PromiseResult<JmapGetResponse<RegistryClusterNode & { id: string }>> {
  const op = "clusterNodeGet"
  const parsed = a.safeParse(clusterNodeGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "ClusterNode" })
}
