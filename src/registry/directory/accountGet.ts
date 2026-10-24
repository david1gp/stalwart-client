import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryAccount } from "../generated/RegistryAccount.js"
import { registryGet } from "../registryGet.js"
import { type AccountGetOptions, accountGetOptionsSchema } from "./accountGetOptionsSchema.js"

/**
 * `x:Account/get` — fetch directory Account entries by id.
 */
export async function accountGet(
  options: AccountGetOptions,
): PromiseResult<JmapGetResponse<RegistryAccount & { id: string }>> {
  const op = "accountGet"
  const parsed = a.safeParse(accountGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registryGet({ config, objectType: "Account" as const, ...rest })
}
