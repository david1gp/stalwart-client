import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistrySecurity } from "../generated/RegistrySecurity.js"
import { registryGet } from "../registryGet.js"
import { securityGetOptionsSchema, type SecurityGetOptions } from "./securityGetOptionsSchema.js"

/**
 * `x:Security/get` — read the automatic IP banning rules singleton
 * (abuse, authentication failures, port scanning).
 */
export async function securityGet(
  options: SecurityGetOptions,
): PromiseResult<JmapGetResponse<RegistrySecurity & { id: string }>> {
  const op = "securityGet"
  const parsed = a.safeParse(securityGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "Security" })
}
