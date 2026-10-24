import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryAuthentication } from "../generated/RegistryAuthentication.js"
import { registryGet } from "../registryGet.js"
import { type AuthenticationGetOptions, authenticationGetOptionsSchema } from "./authenticationGetOptionsSchema.js"

/**
 * `x:Authentication/get` — fetch the singleton Authentication object.
 */
export async function authenticationGet(
  options: AuthenticationGetOptions,
): PromiseResult<JmapGetResponse<RegistryAuthentication & { id: string }>> {
  const op = "authenticationGet"
  const parsed = a.safeParse(authenticationGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registryGet({ config, objectType: "Authentication" as const, ...rest })
}
