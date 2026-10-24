import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import { REGISTRY_SINGLETON_ID } from "../REGISTRY_SINGLETON_ID.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import {
  type AccountSettingsUpdateOptions,
  accountSettingsUpdateOptionsSchema,
} from "./accountSettingsUpdateOptionsSchema.js"

/**
 * `x:AccountSettings/set` — update the singleton AccountSettings object.
 * Singletons update id `"singleton"`; durations are millisecond numbers.
 */
export async function accountSettingsUpdate(
  options: AccountSettingsUpdateOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "accountSettingsUpdate"
  const parsed = a.safeParse(accountSettingsUpdateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({
    config: parsed.output.config,
    objectType: "AccountSettings" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    update: { [REGISTRY_SINGLETON_ID]: parsed.output.patch },
  })
}
