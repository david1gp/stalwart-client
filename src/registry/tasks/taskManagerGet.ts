import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryTaskManager } from "../generated/RegistryTaskManager.js"
import { registryGet } from "../registryGet.js"
import { taskManagerGetOptionsSchema, type TaskManagerGetOptions } from "./taskManagerGetOptionsSchema.js"

/**
 * `x:TaskManager/get` — read the task execution settings singleton
 * (retry strategies).
 */
export async function taskManagerGet(
  options: TaskManagerGetOptions,
): PromiseResult<JmapGetResponse<RegistryTaskManager & { id: string }>> {
  const op = "taskManagerGet"
  const parsed = a.safeParse(taskManagerGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "TaskManager" })
}
