import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryEmail } from "../generated/RegistryEmail.js"
import { registryGet } from "../registryGet.js"
import { sysEmailGetOptionsSchema, type SysEmailGetOptions } from "./sysEmailGetOptionsSchema.js"

/**
 * `x:Email/get` — read the email server settings singleton
 * (message limits, encryption, default folders). Prefixed with `sys`
 * because `emailGet` is the standard JMAP `Email/get` op.
 */
export async function sysEmailGet(
  options: SysEmailGetOptions,
): PromiseResult<JmapGetResponse<RegistryEmail & { id: string }>> {
  const op = "sysEmailGet"
  const parsed = a.safeParse(sysEmailGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "Email" })
}
