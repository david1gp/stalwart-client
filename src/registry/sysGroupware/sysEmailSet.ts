import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { sysEmailSetOptionsSchema, type SysEmailSetOptions } from "./sysEmailSetOptionsSchema.js"

/**
 * `x:Email/set` — patch the email server settings singleton. Prefixed with
 * `sys` because `emailSet` is the standard JMAP `Email/set` op.
 * Any `notUpdated` entry becomes a ResultErr via `jmapSetErrorCheck`.
 */
export async function sysEmailSet(options: SysEmailSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "sysEmailSet"
  const parsed = a.safeParse(sysEmailSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const response = await registrySet({
    config: parsed.output.config,
    objectType: "Email",
    update: { singleton: parsed.output.patch },
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
  })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
