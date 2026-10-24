import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type AccountSetOptions, accountSetOptionsSchema } from "./accountSetOptionsSchema.js"

/**
 * `x:Account/set` — create, update and/or destroy directory Account entries.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry makes the call a ResultErr.
 */
export async function accountSet(options: AccountSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "accountSet"
  const parsed = a.safeParse(accountSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registrySet({ config, objectType: "Account" as const, ...rest })
}
