import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryTask } from "../generated/RegistryTask.js"
import { registryGet } from "../registryGet.js"
import { taskGetOptionsSchema, type TaskGetOptions } from "./taskGetOptionsSchema.js"

/**
 * `x:Task/get` — fetch background tasks scheduled for execution by id.
 */
export async function taskGet(options: TaskGetOptions): PromiseResult<JmapGetResponse<RegistryTask & { id: string }>> {
  const op = "taskGet"
  const parsed = a.safeParse(taskGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "Task" })
}
