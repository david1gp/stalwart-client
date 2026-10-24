import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import { REGISTRY_SINGLETON_ID } from "../REGISTRY_SINGLETON_ID.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import {
  type AuthenticationUpdateOptions,
  authenticationUpdateOptionsSchema,
} from "./authenticationUpdateOptionsSchema.js"

/**
 * `x:Authentication/set` — update the singleton Authentication object.
 * Singletons update id `"singleton"`; durations are millisecond numbers.
 */
export async function authenticationUpdate(
  options: AuthenticationUpdateOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "authenticationUpdate"
  const parsed = a.safeParse(authenticationUpdateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({
    config: parsed.output.config,
    objectType: "Authentication" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    update: { [REGISTRY_SINGLETON_ID]: parsed.output.patch },
  })
}
