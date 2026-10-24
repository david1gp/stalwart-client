import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryHttp } from "../generated/RegistryHttp.js"
import { registryGet } from "../registryGet.js"
import { httpGetOptionsSchema, type HttpGetOptions } from "./httpGetOptionsSchema.js"

/**
 * `x:Http/get` — read the HTTP server settings singleton
 * (rate limiting, CORS, security headers).
 */
export async function httpGet(options: HttpGetOptions): PromiseResult<JmapGetResponse<RegistryHttp & { id: string }>> {
  const op = "httpGet"
  const parsed = a.safeParse(httpGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "Http" })
}
