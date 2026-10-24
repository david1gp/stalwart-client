import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { aiModelSetOptionsSchema, type AiModelSetOptions } from "./aiModelSetOptionsSchema.js"

/**
 * `x:AiModel/set` — create, update and/or destroy AI model endpoints.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry becomes a ResultErr
 * via `jmapSetErrorCheck`.
 */
export async function aiModelSet(options: AiModelSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "aiModelSet"
  const parsed = a.safeParse(aiModelSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const response = await registrySet({ ...parsed.output, objectType: "AiModel" })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
