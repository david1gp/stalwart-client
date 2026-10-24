import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { taskSetOptionsSchema, type TaskSetOptions } from "./taskSetOptionsSchema.js"

/**
 * `x:Task/set` — create, update and/or destroy background tasks
 * (`crates/jmap/src/registry/mapping/task.rs`). Any
 * `notCreated`/`notUpdated`/`notDestroyed` entry becomes a ResultErr
 * via `jmapSetErrorCheck`.
 */
export async function taskSet(options: TaskSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "taskSet"
  const parsed = a.safeParse(taskSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const response = await registrySet({ ...parsed.output, objectType: "Task" })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
