import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type AccountDestroyOptions, accountDestroyOptionsSchema } from "./accountDestroyOptionsSchema.js"

/**
 * `x:Account/set` destroy — destroy one directory Account entry by id.
 */
export async function accountDestroy(options: AccountDestroyOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "accountDestroy"
  const parsed = a.safeParse(accountDestroyOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({
    config: parsed.output.config,
    objectType: "Account" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    destroy: [parsed.output.id],
  })
}
