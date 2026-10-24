import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { webDavSetOptionsSchema, type WebDavSetOptions } from "./webDavSetOptionsSchema.js"

/**
 * `x:WebDav/set` — patch the WebDAV protocol settings singleton.
 * Any `notUpdated` entry becomes a ResultErr via `jmapSetErrorCheck`.
 */
export async function webDavSet(options: WebDavSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "webDavSet"
  const parsed = a.safeParse(webDavSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const response = await registrySet({
    config: parsed.output.config,
    objectType: "WebDav",
    update: { singleton: parsed.output.patch },
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
  })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
