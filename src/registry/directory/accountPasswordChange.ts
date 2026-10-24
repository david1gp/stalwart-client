import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import { REGISTRY_SINGLETON_ID } from "../REGISTRY_SINGLETON_ID.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import {
  type AccountPasswordChangeOptions,
  accountPasswordChangeOptionsSchema,
} from "./accountPasswordChangeOptionsSchema.js"

/**
 * Change the caller's own password: `x:AccountPassword/set` on id
 * `"singleton"` with `{secret, currentSecret}`.
 * Omit `accountId` to change the authenticated user's own password (the
 * server fills in the caller account for registry methods). A wrong
 * `currentSecret` is `notUpdated/forbidden "Current secret is incorrect."`
 * (`crates/jmap/src/registry/mapping/account.rs:236-260`); repeated wrong
 * guesses trip fail2ban, so callers must not retry blindly.
 */
export async function accountPasswordChange(
  options: AccountPasswordChangeOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "accountPasswordChange"
  const parsed = a.safeParse(accountPasswordChangeOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({
    config: parsed.output.config,
    objectType: "AccountPassword" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    update: {
      [REGISTRY_SINGLETON_ID]: { secret: parsed.output.newSecret, currentSecret: parsed.output.currentSecret },
    },
  })
}
