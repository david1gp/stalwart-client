import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type AccountUpdateOptions, accountUpdateOptionsSchema } from "./accountUpdateOptionsSchema.js"

/**
 * `x:Account/set` update — update one directory Account entry by id.
 */
export async function accountUpdate(options: AccountUpdateOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "accountUpdate"
  const parsed = a.safeParse(accountUpdateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({
    config: parsed.output.config,
    objectType: "Account" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    update: { [parsed.output.id]: parsed.output.patch },
  })
}
