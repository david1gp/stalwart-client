import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { clusterRoleSetOptionsSchema, type ClusterRoleSetOptions } from "./clusterRoleSetOptionsSchema.js"

/**
 * `x:ClusterRole/set` — create, update and/or destroy cluster node roles.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry becomes a ResultErr
 * via `jmapSetErrorCheck`.
 */
export async function clusterRoleSet(options: ClusterRoleSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "clusterRoleSet"
  const parsed = a.safeParse(clusterRoleSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const response = await registrySet({ ...parsed.output, objectType: "ClusterRole" })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
