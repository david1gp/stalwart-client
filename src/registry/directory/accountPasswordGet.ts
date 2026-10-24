import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryAccountPassword } from "../generated/RegistryAccountPassword.js"
import { registryGet } from "../registryGet.js"
import { type AccountPasswordGetOptions, accountPasswordGetOptionsSchema } from "./accountPasswordGetOptionsSchema.js"

/**
 * `x:AccountPassword/get` — fetch the singleton AccountPassword object.
 */
export async function accountPasswordGet(
  options: AccountPasswordGetOptions,
): PromiseResult<JmapGetResponse<RegistryAccountPassword & { id: string }>> {
  const op = "accountPasswordGet"
  const parsed = a.safeParse(accountPasswordGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registryGet({ config, objectType: "AccountPassword" as const, ...rest })
}
