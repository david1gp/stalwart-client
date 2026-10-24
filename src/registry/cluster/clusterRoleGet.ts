import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryClusterRole } from "../generated/RegistryClusterRole.js"
import { registryGet } from "../registryGet.js"
import { clusterRoleGetOptionsSchema, type ClusterRoleGetOptions } from "./clusterRoleGetOptionsSchema.js"

/**
 * `x:ClusterRole/get` — fetch cluster node role definitions by id
 * (enabled tasks and listeners per role).
 */
export async function clusterRoleGet(
  options: ClusterRoleGetOptions,
): PromiseResult<JmapGetResponse<RegistryClusterRole & { id: string }>> {
  const op = "clusterRoleGet"
  const parsed = a.safeParse(clusterRoleGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "ClusterRole" })
}
