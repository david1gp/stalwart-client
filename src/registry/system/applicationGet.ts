import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryApplication } from "../generated/RegistryApplication.js"
import { registryGet } from "../registryGet.js"
import { applicationGetOptionsSchema, type ApplicationGetOptions } from "./applicationGetOptionsSchema.js"

/**
 * `x:Application/get` — fetch web applications served by the server by id.
 */
export async function applicationGet(
  options: ApplicationGetOptions,
): PromiseResult<JmapGetResponse<RegistryApplication & { id: string }>> {
  const op = "applicationGet"
  const parsed = a.safeParse(applicationGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "Application" })
}
