import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistryWebHook } from "../generated/RegistryWebHook.js"
import { type WebHookGetOptions, webHookGetOptionsSchema } from "./webHookGetOptionsSchema.js"

/**
 * `x:WebHook/get` — fetch event-notification webhook endpoints by id.
 */
export async function webHookGet(options: WebHookGetOptions): PromiseResult<JmapGetResponse<RegistryWebHook>> {
  const op = "webHookGet"
  const parsed = a.safeParse(webHookGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryGet({ config, objectType: "WebHook", ...args })
}
