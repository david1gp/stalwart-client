import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { httpSetOptionsSchema, type HttpSetOptions } from "./httpSetOptionsSchema.js"

/**
 * `x:Http/set` — patch the HTTP server settings singleton.
 * Any `notUpdated` entry becomes a ResultErr via `jmapSetErrorCheck`.
 */
export async function httpSet(options: HttpSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "httpSet"
  const parsed = a.safeParse(httpSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const response = await registrySet({
    config: parsed.output.config,
    objectType: "Http",
    update: { singleton: parsed.output.patch },
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
  })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
