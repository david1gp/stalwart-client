import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { applicationSetOptionsSchema, type ApplicationSetOptions } from "./applicationSetOptionsSchema.js"

/**
 * `x:Application/set` — create, update and/or destroy web applications.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry becomes a ResultErr
 * via `jmapSetErrorCheck`.
 */
export async function applicationSet(options: ApplicationSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "applicationSet"
  const parsed = a.safeParse(applicationSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const response = await registrySet({ ...parsed.output, objectType: "Application" })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
