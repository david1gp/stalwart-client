import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryAccountSettings } from "../generated/RegistryAccountSettings.js"
import { registryGet } from "../registryGet.js"
import { type AccountSettingsGetOptions, accountSettingsGetOptionsSchema } from "./accountSettingsGetOptionsSchema.js"

/**
 * `x:AccountSettings/get` — fetch the singleton AccountSettings object.
 */
export async function accountSettingsGet(
  options: AccountSettingsGetOptions,
): PromiseResult<JmapGetResponse<RegistryAccountSettings & { id: string }>> {
  const op = "accountSettingsGet"
  const parsed = a.safeParse(accountSettingsGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registryGet({ config, objectType: "AccountSettings" as const, ...rest })
}
