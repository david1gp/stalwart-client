import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { taskManagerSetOptionsSchema, type TaskManagerSetOptions } from "./taskManagerSetOptionsSchema.js"

/**
 * `x:TaskManager/set` — patch the task execution settings singleton.
 * Any `notUpdated` entry becomes a ResultErr via `jmapSetErrorCheck`.
 */
export async function taskManagerSet(options: TaskManagerSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "taskManagerSet"
  const parsed = a.safeParse(taskManagerSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const response = await registrySet({
    config: parsed.output.config,
    objectType: "TaskManager",
    update: { singleton: parsed.output.patch },
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
  })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
