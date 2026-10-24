import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { coordinatorSetOptionsSchema, type CoordinatorSetOptions } from "./coordinatorSetOptionsSchema.js"

/**
 * `x:Coordinator/set` — patch the cluster coordinator singleton.
 * Any `notUpdated` entry becomes a ResultErr via `jmapSetErrorCheck`.
 */
export async function coordinatorSet(options: CoordinatorSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "coordinatorSet"
  const parsed = a.safeParse(coordinatorSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const response = await registrySet({
    config: parsed.output.config,
    objectType: "Coordinator",
    update: { singleton: parsed.output.patch },
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
  })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
