import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryCoordinator } from "../generated/RegistryCoordinator.js"
import { registryGet } from "../registryGet.js"
import { coordinatorGetOptionsSchema, type CoordinatorGetOptions } from "./coordinatorGetOptionsSchema.js"

/**
 * `x:Coordinator/get` — read the cluster coordinator singleton
 * (`Disabled` on single-node installs; Kafka/Nats/Zenoh/Redis otherwise).
 */
export async function coordinatorGet(
  options: CoordinatorGetOptions,
): PromiseResult<JmapGetResponse<RegistryCoordinator & { id: string }>> {
  const op = "coordinatorGet"
  const parsed = a.safeParse(coordinatorGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "Coordinator" })
}
