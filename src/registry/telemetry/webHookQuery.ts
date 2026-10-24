import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { type WebHookQueryOptions, webHookQueryOptionsSchema } from "./webHookQueryOptionsSchema.js"

/**
 * `x:WebHook/query` — list event-notification webhook endpoint ids.
 * Standard registry filters (property equality and `Is*` comparisons).
 */
export async function webHookQuery(options: WebHookQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "webHookQuery"
  const parsed = a.safeParse(webHookQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryQuery({ config, objectType: "WebHook", ...args })
}
