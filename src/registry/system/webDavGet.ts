import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryWebDav } from "../generated/RegistryWebDav.js"
import { registryGet } from "../registryGet.js"
import { webDavGetOptionsSchema, type WebDavGetOptions } from "./webDavGetOptionsSchema.js"

/**
 * `x:WebDav/get` — read the WebDAV protocol settings singleton
 * (property limits, locking).
 */
export async function webDavGet(
  options: WebDavGetOptions,
): PromiseResult<JmapGetResponse<RegistryWebDav & { id: string }>> {
  const op = "webDavGet"
  const parsed = a.safeParse(webDavGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "WebDav" })
}
