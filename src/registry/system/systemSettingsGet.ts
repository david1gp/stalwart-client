import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistrySystemSettings } from "../generated/RegistrySystemSettings.js"
import { registryGet } from "../registryGet.js"
import { systemSettingsGetOptionsSchema, type SystemSettingsGetOptions } from "./systemSettingsGetOptionsSchema.js"

/**
 * `x:SystemSettings/get` — read the core server settings singleton
 * (hostname, thread pool, network services).
 */
export async function systemSettingsGet(
  options: SystemSettingsGetOptions,
): PromiseResult<JmapGetResponse<RegistrySystemSettings & { id: string }>> {
  const op = "systemSettingsGet"
  const parsed = a.safeParse(systemSettingsGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "SystemSettings" })
}
