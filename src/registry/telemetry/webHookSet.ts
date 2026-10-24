import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type WebHookSetOptions, webHookSetOptionsSchema } from "./webHookSetOptionsSchema.js"

/**
 * `x:WebHook/set` — create, update and/or destroy event-notification webhook endpoints.
 * Any non-empty `notCreated`/`notUpdated`/`notDestroyed` entry makes the whole
 * call a ResultErr carrying the full SetResponse in `errorData`.
 */
export async function webHookSet(options: WebHookSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "webHookSet"
  const parsed = a.safeParse(webHookSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  const response = await registrySet({ config, objectType: "WebHook", ...args })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
