import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import { REGISTRY_SINGLETON_ID } from "../REGISTRY_SINGLETON_ID.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import {
  type AccountPasswordUpdateOptions,
  accountPasswordUpdateOptionsSchema,
} from "./accountPasswordUpdateOptionsSchema.js"

/**
 * `x:AccountPassword/set` — update the singleton AccountPassword object.
 * Singletons update id `"singleton"`; durations are millisecond numbers.
 */
export async function accountPasswordUpdate(
  options: AccountPasswordUpdateOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "accountPasswordUpdate"
  const parsed = a.safeParse(accountPasswordUpdateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({
    config: parsed.output.config,
    objectType: "AccountPassword" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    update: { [REGISTRY_SINGLETON_ID]: parsed.output.patch },
  })
}
